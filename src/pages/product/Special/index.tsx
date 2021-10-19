import { PlusOutlined } from '@ant-design/icons'
import { Button, message, FormInstance } from 'antd'
import React, { useState, useRef } from 'react'
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout'
import type { ProColumns, ActionType } from '@ant-design/pro-table'
import ProTable from '@ant-design/pro-table'
import { ModalForm, ProFormText, ProFormSwitch, ProFormSelect, ProFormDateTimePicker, ProFormTextArea, ProFormMoney } from '@ant-design/pro-form'
import {
  listSpecialProduct, createSpecialProduct, updateSpecialProduct,
  batchRemoveSpecialProduct, batchStatus,
  removeSpecialProduct,
  SpecialProductT,
  pageParamsT,
  listProduct
} from '@/services/product'

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: SpecialProductT) => {
  const hide = message.loading('正在添加')
  try {
    await createSpecialProduct({ ...fields })
    hide()
    message.success('操作成功')
    return true
  } catch (error) {
    hide()
    message.error('操作失败，请稍后重试')
    return false
  }
}

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: SpecialProductT) => {
  const hide = message.loading('修改中')
  try {
    await updateSpecialProduct(fields.id!, fields)
    hide()

    message.success('操作成功')
    return true
  } catch (error) {
    hide()
    message.error('操作失败，请稍后重试')
    return false
  }
}

/**
 *  Delete node
 * @zh-CN 批量删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: SpecialProductT[]) => {
  const hide = message.loading('正在删除')
  if (!selectedRows) return true
  try {
    const ids = selectedRows.map(row => row.id) as string[]
    await batchRemoveSpecialProduct(ids)
    hide()
    message.success('成功删除，即将刷新列表')
    return true
  } catch (error) {
    hide()
    message.error('删除失败，请重试')
    return false
  }
}
const handleBatchStatus = async (status: number, selectedRows: SpecialProductT[]) => {
  const hide = message.loading('正在批量设置。。。')
  if (!selectedRows) return true
  try {
    const ids = selectedRows.map(row => row.id) as string[]
    await batchStatus(status, ids)
    hide()
    message.success('成功设置，即将刷新列表')
    return true
  } catch (error) {
    hide()
    message.error('设置失败，请重试')
    return false
  }
}

// 删除单个节点
const handleRemove1 = async (row: SpecialProductT) => {
  const hide = message.loading('正在删除')

  try {
    await removeSpecialProduct(row.id!)
    hide()
    message.success('成功删除，即将刷新列表')
    return true
  } catch (error) {
    hide()
    message.error('删除失败，请重试')
    return false
  }
}

const TableList: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const actionRef = useRef<ActionType>()
  const createFormRef = useRef<FormInstance>()
  const editFormRef = useRef<FormInstance>()
  const [selectedRowsState, setSelectedRows] = useState<SpecialProductT[]>([])

  const columns: ProColumns<SpecialProductT>[] = [
    {
      title: '产品名称',
      dataIndex: 'product_id',
      render: (_, record) => <span>{record.product?.name}</span>
    },
    {
      title: '原价',
      dataIndex: 'ori_price',
    },
    {
      title: '现价（促销价）',
      dataIndex: 'now_price',
    },
    {
      title: '促销语',
      dataIndex: 'slogan',
    },
    {
      title: '促销开始',
      dataIndex: 'available_from',
      valueType: 'dateTime'
    },
    {
      title: '促销结束',
      dataIndex: 'available_to',
      valueType: 'dateTime'
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            editFormRef.current?.setFieldsValue(record)
            setShowEditModal(true)
          }}
        >
          修改
        </a>,
        <a
          key="remove"
          onClick={async () => {
            await handleRemove1(record)
            actionRef.current?.reloadAndRest?.()
          }}
        >
          删除
        </a>,

      ],
    }
  ]

  return (
    <PageContainer>
      <ProTable<SpecialProductT, API.PageParams>
        headerTitle='分类列表'
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalVisible(true)
            }}
          >
            <PlusOutlined /> 新增
          </Button>,
        ]}
        request={async (
          // 第一个参数 params 查询表单和 params 参数的结合
          // 第一个参数中一定会有 pageSize 和  current ，这两个参数是 antd 的规范
          params
        ) => {
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改

          const res = await listSpecialProduct(params as pageParamsT)
          return {
            data: res.data,
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: res.success,
            // 不传会使用 data 的长度，如果是分页一定要传
            total: res.meta.total,
          }
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows)
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>已选择<a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>项</div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState)
              setSelectedRows([])
              actionRef.current?.reloadAndRest?.()
            }}
          >批量删除</Button>
          <Button type='primary'
            onClick={async () => {
              await handleBatchStatus(1, selectedRowsState)
              setSelectedRows([])
              actionRef.current?.reloadAndRest?.()
            }}>批量启用</Button>
          <Button type='dashed'
            onClick={async () => {
              await handleBatchStatus(0, selectedRowsState)
              setSelectedRows([])
              actionRef.current?.reloadAndRest?.()
            }}>批量禁用</Button>
        </FooterToolbar>
      )}
      {/* 新增的modal表单 */}
      <ModalForm
        formRef={createFormRef}
        title='新增'
        width="600px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value as SpecialProductT)
          if (success) {
            handleModalVisible(false)
            if (actionRef.current) {
              actionRef.current.reload()
            }
            createFormRef.current?.resetFields()
          }
        }}
      >
        <ProFormSelect
          showSearch
          name="product_id"
          label="产品"
          // @ts-ignore
          onChange={(_, row) => {
            if (row) {
              console.log(row.price)
              createFormRef.current?.setFieldsValue({ ori_price: row.price })
            } else {
              createFormRef.current?.setFieldsValue({ ori_price: '' })
            }
          }}
          // todo 改成本地数据后 search改成过滤本地数据
          request={async ({ keyword }) => {
            let params = {
              'filter[is_special]': 0,
            }
            if (keyword) {
              params['filter[name]'] = keyword
            }
            // @ts-ignore
            const res = await listProduct(params)
            console.log(res)
            const options = res.data.map(item => ({ label: item.name, value: item.id, price: item.price }))
            return options
          }}
        />
        <ProFormDateTimePicker name="available_from" label="促销开始" />
        <ProFormDateTimePicker name="available_to" label="促销结束" />
        <ProFormTextArea name='slogan' label='促销语' />
        <ProFormMoney name='ori_price' label='原价' readonly />
        <ProFormMoney name='now_price' label='现价（促销价）' />


      </ModalForm>
      {/* 修改的modal表单 */}
      <ModalForm
        formRef={editFormRef}
        title='修改'
        width="600px"
        visible={showEditModal}
        onVisibleChange={setShowEditModal}
        onFinish={async (value) => {
          const success = await handleUpdate(value)
          if (success) {
            setShowEditModal(false)
            if (actionRef.current) {
              actionRef.current.reload()
            }
            editFormRef.current?.resetFields()
          }
        }}
      >
        <ProFormText
          label='分类名称'
          rules={[
            {
              required: true,
              message: '必填',
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormSelect
          showSearch
          name="parent_id"
          label="父分类"
          request={async () => {
            return []
          }}
        />
        <ProFormText
          label='分类排序值'
          rules={[
            {
              required: true,
              message: '必填',
            },
          ]}
          width="md"
          name="order"
        />
        <ProFormText hidden name="id" />
        <ProFormSwitch name="is_enabled" label="是否启用" />

      </ModalForm>

    </PageContainer>
  )
}

export default TableList
