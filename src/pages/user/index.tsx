import { PlusOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import React, { useState, useRef } from 'react'
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout'
import type { ProColumns, ActionType } from '@ant-design/pro-table'
import ProTable from '@ant-design/pro-table'
import {
  // updateUser,
  batchRemoveUser, batchStatus,
  removeUser,
  listUser,
  TypeUser
} from '@/services/user'
import EditForm from './EditForm'

/* type FormValueType = {
  is_featured?: boolean
  is_enabled?: boolean
  description_html?: string
  description_raw?: string
} & Partial<TypeUser>
 */
export type descriptionT = {
  raw: string
  html: string
}

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
/* const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('修改中')
  try {
    await updateUser(fields.id!, {
      name: fields.name,
      price: fields.price,
      order: fields.order,
      description_html: fields.description_html,
      description_raw: fields.description_raw,
      category_id: fields.category_id,
      is_featured: fields.is_featured,
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
} */
/**
 *  Delete node
 * @zh-CN 批量删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: TypeUser[]) => {
  const hide = message.loading('正在删除')
  if (!selectedRows) return true
  try {
    const ids = selectedRows.map(row => row.id) as string[]
    await batchRemoveUser(ids)
    hide()
    message.success('成功删除，即将刷新列表')
    return true
  } catch (error) {
    hide()
    message.error('删除失败，请重试')
    return false
  }
}
const handleBatchStatus = async (status: number, selectedRows: TypeUser[]) => {
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
const handleRemove1 = async (row: TypeUser) => {
  const hide = message.loading('正在删除')

  try {
    await removeUser(row.id!)
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
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentRow, setCurrentRow] = useState<TypeUser>()

  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */

  const tableRef = useRef<ActionType>()
  const [selectedRowsState, setSelectedRows] = useState<TypeUser[]>([])
  const [description, setDescription] = useState<descriptionT>()

  const columns: ProColumns<TypeUser>[] = [
    {
      title: '用户昵称',
      dataIndex: 'nickname'
    },
    {
      title: '手机号',
      dataIndex: 'phone',
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      valueEnum: {
        0: '未知',
        1: '男',
        2: '女'
      },
    },
    {
      title: '年龄',
      dataIndex: 'age',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record)
            setShowEditForm(true)
          }}
        >
          修改
        </a>,
        <a
          key="remove"
          onClick={async () => {
            await handleRemove1(record)
            tableRef.current?.reloadAndRest?.()
          }}
        >
          删除
        </a>,

      ],
    }
  ]

  return (
    <PageContainer className='userPage'>
      <ProTable<TypeUser, API.PageParams>
        headerTitle='分类列表'
        actionRef={tableRef}
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
              console.log('hello')
            }}
          >
            <PlusOutlined /> 待定
          </Button>,
        ]}

        request={async (
          // 第一个参数 params 查询表单和 params 参数的结合
          // 第一个参数中一定会有 pageSize 和  current ，这两个参数是 antd 的规范
          params: {
            current?: number, pageSize?: number,
            name?: string
            nickname?: string
            phone?: string
            gender?: number
          }
        ) => {
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改
          const searchParams = {
            page: params.current,
            per_page: params.pageSize,
            'filter[name]': params.name,
            'filter[nickname]': params.nickname,
            'filter[phone]': params.phone,
            'filter[gender]': params.gender,
          }
          const res = await listUser(searchParams)
          return {
            data: res.data,
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: res.success,
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
              tableRef.current?.reloadAndRest?.()
            }}
          >批量删除</Button>
          <Button type='primary'
            onClick={async () => {
              await handleBatchStatus(1, selectedRowsState)
              setSelectedRows([])
              tableRef.current?.reloadAndRest?.()
            }}>批量启用</Button>
          <Button type='dashed'
            onClick={async () => {
              await handleBatchStatus(0, selectedRowsState)
              setSelectedRows([])
              tableRef.current?.reloadAndRest?.()
            }}>批量禁用</Button>
        </FooterToolbar>
      )}

      <EditForm
        onSubmit={async (data) => {
          console.log('父组件收到的', data)
          const userData = { ...data, description_html: description?.html, description_raw: description?.raw }
          // const success = await handleUpdate(userData as FormValueType)
          console.log(userData)
          /* if (success) {
            setShowEditForm(false)
            setCurrentRow(undefined)
            if (tableRef.current) {
              tableRef.current.reload()
            }
            return true
          } else {
            return false
          } */
        }}
        onCancel={() => {
          setShowEditForm(false)
          setCurrentRow(undefined)
        }}
        showForm={showEditForm}
        values={currentRow || {}}
        setDescription={setDescription}
      />


    </PageContainer>
  )
}

export default TableList
