<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float:right"
          type="primary"
          @click="handleSearchList()"
          size="small">
          查询搜索
        </el-button>
        <el-button
          style="float:right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="用户名：">
            <el-input v-model="listQuery.username" class="input-width" placeholder="请输入用户名" clearable></el-input>
          </el-form-item>
          <el-form-item label="请求方法：">
            <el-select v-model="listQuery.method" placeholder="请选择请求方法" clearable>
              <el-option label="GET" value="GET"></el-option>
              <el-option label="POST" value="POST"></el-option>
              <el-option label="PUT" value="PUT"></el-option>
              <el-option label="DELETE" value="DELETE"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
    </el-card>
    <div class="table-container">
      <el-table ref="logTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" 
                border>
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="用户名" width="120" align="center">
          <template slot-scope="scope">{{scope.row.username}}</template>
        </el-table-column>
        <el-table-column label="IP地址" width="140" align="center">
          <template slot-scope="scope">{{scope.row.ip}}</template>
        </el-table-column>
        <el-table-column label="请求方法" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getMethodTagType(scope.row.method)">{{scope.row.method}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作描述" align="center" min-width="200">
          <template slot-scope="scope">{{scope.row.description}}</template>
        </el-table-column>
        <el-table-column label="请求参数" align="center" min-width="250">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" :content="scope.row.params" placement="top">
              <span class="params-text">{{formatParams(scope.row.params)}}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="耗时(ms)" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getSpendTimeTagType(scope.row.spendTime)">{{scope.row.spendTime}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160" align="center">
          <template slot-scope="scope">{{scope.row.createTime | formatDateTime}}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       @click="handleViewDetail(scope.$index, scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize"
        :page-sizes="[5,10,15,20]"
        :total="total">
      </el-pagination>
    </div>
    
    <!-- 详情对话框 -->
    <el-dialog
      title="日志详情"
      :visible.sync="detailDialogVisible"
      width="60%">
      <el-form :model="currentLog" label-width="120px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="编号：">
              <span>{{currentLog.id}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名：">
              <span>{{currentLog.username}}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="IP地址：">
              <span>{{currentLog.ip}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求方法：">
              <el-tag :type="getMethodTagType(currentLog.method)">{{currentLog.method}}</el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="耗时(ms)：">
              <el-tag :type="getSpendTimeTagType(currentLog.spendTime)">{{currentLog.spendTime}}</el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建时间：">
              <span>{{currentLog.createTime | formatDateTime}}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="操作描述：">
          <span>{{currentLog.description}}</span>
        </el-form-item>
        <el-form-item label="请求参数：">
          <el-input
            type="textarea"
            :rows="6"
            :value="formatJsonParams(currentLog.params)"
            readonly>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false" size="small">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchLogList, getLogById } from '@/api/webLog';
import { formatDate } from '@/utils/date';

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
  username: null,
  method: null
};

export default {
  name: 'webLogList',
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: null,
      listLoading: false,
      detailDialogVisible: false,
      currentLog: {}
    }
  },
  created() {
    this.getList();
  },
  filters: {
    formatDateTime(time) {
      if (time == null || time === '') {
        return 'N/A';
      }
      let date = new Date(time);
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    }
  },
  methods: {
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultListQuery);
    },
    handleSearchList() {
      this.listQuery.pageNum = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleViewDetail(index, row) {
      this.currentLog = Object.assign({}, row);
      this.detailDialogVisible = true;
    },
    getList() {
      this.listLoading = true;
      fetchLogList(this.listQuery).then(response => {
        this.listLoading = false;
        this.list = response.data.list;
        this.total = response.data.total;
      }).catch(() => {
        this.listLoading = false;
      });
    },
    getMethodTagType(method) {
      switch (method) {
        case 'GET':
          return 'success';
        case 'POST':
          return 'primary';
        case 'PUT':
          return 'warning';
        case 'DELETE':
          return 'danger';
        default:
          return 'info';
      }
    },
    getSpendTimeTagType(spendTime) {
      if (spendTime < 100) {
        return 'success';
      } else if (spendTime < 500) {
        return 'warning';
      } else {
        return 'danger';
      }
    },
    formatParams(params) {
      if (!params) return '';
      if (params.length > 50) {
        return params.substring(0, 50) + '...';
      }
      return params;
    },
    formatJsonParams(params) {
      if (!params) return '';
      try {
        const parsed = JSON.parse(params);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        return params;
      }
    }
  }
}
</script>

<style scoped>
.input-width {
  width: 200px;
}

.params-text {
  cursor: pointer;
  color: #409EFF;
}

.params-text:hover {
  text-decoration: underline;
}
</style>
