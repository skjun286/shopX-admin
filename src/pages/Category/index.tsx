import { PlusOutlined } from '@ant-design/icons'
import { Button, message, FormInstance } from 'antd'
import React, { useState, useRef, useEffect } from 'react'
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout'
import type { ProColumns, ActionType } from '@ant-design/pro-table'
import ProTable from '@ant-design/pro-table'
import { ModalForm, ProFormText, ProFormSwitch, ProFormSelect } from '@ant-design/pro-form'
import {
  listCategory, createCategory, updateCategory,
  batchRemoveCategory, batchStatus,
  removeCategory,
  rootCategories, TypeCategory, TypeCategoryOption
} from '@/services/category'

export type FormValueType = {
  name?: string
  parent_id?: number
  order?: number
  is_enabled?: number
} & Partial<TypeCategory>


/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: TypeCategory) => {
  const hide = message.loading('正在添加')
  try {
    await createCategory({ ...fields })
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
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('修改中')
  try {
    await updateCategory(fields.id!, {
      name: fields.name,
      order: fields.order,
      parent_id: fields.parent_id,
      is_enabled: fields.is_enabled
    })
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
const handleRemove = async (selectedRows: TypeCategory[]) => {
  const hide = message.loading('正在删除')
  if (!selectedRows) return true
  try {
    const ids = selectedRows.map(row => row.id) as string[]
    await batchRemoveCategory(ids)
    hide()
    message.success('成功删除，即将刷新列表')
    return true
  } catch (error) {
    hide()
    message.error('删除失败，请重试')
    return false
  }
}
const handleBatchStatus = async (status: number, selectedRows: TypeCategory[]) => {
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
const handleRemove1 = async (row: TypeCategory) => {
  const hide = message.loading('正在删除')

  try {
    await removeCategory(row.id!)
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
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */

  const actionRef = useRef<ActionType>()
  const createFormRef = useRef<FormInstance>()
  const editFormRef = useRef<FormInstance>()
  const [selectedRowsState, setSelectedRows] = useState<TypeCategory[]>([])
  const [categoryOptions, setCategoryOptions] = useState({})

  useEffect(() => {
    (async () => {
      const res = await rootCategories()
      let options = {}
      res.data.forEach((row: TypeCategoryOption) => {
        options[row['value']] = row['label']
      })
      // const options = res.data.map
      setCategoryOptions(options)
    })()
  }, [])

  const columns: ProColumns<TypeCategory>[] = [
    {
      title: '分类名',
      dataIndex: 'name'
    },
    {
      title: '状态',
      dataIndex: 'is_enabled',
      valueEnum: {
        0: {
          text: '已禁用',
          status: 'Error',
        },
        1: {
          text: '已启用',
          status: 'Success',
        }
      },
    },
    {
      title: '父分类',
      dataIndex: 'parent_id',
      valueEnum: categoryOptions,
      render: (_, record) => <span>{record.parent !== null ? record.parent?.name : ''}</span>
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
      <ProTable<TypeCategory, API.PageParams>
        headerTitle='分类列表'
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
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
          params: { current?: number, pageSize?: number, name?: string, is_enabled?: number, parent_id?: string }
        ) => {
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改

          const searchParams = {
            page: params.current,
            per_page: params.pageSize,
            'filter[name]': params.name,
            'filter[is_enabled]': params.is_enabled,
            'filter[parent_id]': params.parent_id,
            include: 'parent',
          }
          const res = await listCategory(searchParams)
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
        initialValues={{ parent_id: null, order: 0, is_enabled: true }}
        title='新增'
        width="600px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value as TypeCategory)
          if (success) {
            handleModalVisible(false)
            if (actionRef.current) {
              actionRef.current.reload()
            }
            createFormRef.current?.resetFields()
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
          // todo search 改成过滤本地数据
          name="parent_id"
          label="父分类"
          // todo 改成本地数据后 search改成过滤本地数据
          request={async () => {
            const res = await rootCategories()
            console.log(res.data)
            return res.data
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
        <ProFormSwitch name="is_enabled" label="是否启用" />

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
            const res = await rootCategories()
            return res.data
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
