import { PlusOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import React, { useState, useRef, useEffect } from 'react'
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout'
import type { ProColumns, ActionType } from '@ant-design/pro-table'
import ProTable from '@ant-design/pro-table'
import {
  listProduct, createProduct, updateProduct,
  batchRemoveProduct, batchStatus,
  removeProduct,
  TypeProduct
} from '@/services/product'
import { listCategory } from '@/services/category'
import CreateForm from './CreateForm'
import EditForm from './EditForm'
import './index.less'

type FormValueType = {
  is_featured?: boolean
  is_enabled?: boolean
  description_html?: string
  description_raw?: string
} & Partial<TypeProduct>

export type descriptionT = {
  raw: string
  html: string
}

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: TypeProduct) => {
  const hide = message.loading('正在添加')
  try {
    await createProduct({ ...fields })
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
    await updateProduct(fields.id!, {
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
}

/**
 *  Delete node
 * @zh-CN 批量删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: TypeProduct[]) => {
  const hide = message.loading('正在删除')
  if (!selectedRows) return true
  try {
    const ids = selectedRows.map(row => row.id) as string[]
    await batchRemoveProduct(ids)
    hide()
    message.success('成功删除，即将刷新列表')
    return true
  } catch (error) {
    hide()
    message.error('删除失败，请重试')
    return false
  }
}
const handleBatchStatus = async (status: number, selectedRows: TypeProduct[]) => {
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
const handleRemove1 = async (row: TypeProduct) => {
  const hide = message.loading('正在删除')

  try {
    await removeProduct(row.id!)
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
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentRow, setCurrentRow] = useState<TypeProduct>()

  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */

  const tableRef = useRef<ActionType>()
  const [selectedRowsState, setSelectedRows] = useState<TypeProduct[]>([])
  const [categoryEnum, setCategoryEnum] = useState({})
  const [description, setDescription] = useState<descriptionT>()
  useEffect(() => {
    (async () => {
      const res = await listCategory({ current_page: 1, per_page: 1000 })
      let options = {}
      res.data.map(row => {
        options[row.id] = row.name
        // options[row.id] = { text: row.name }
      })
      setCategoryEnum(options)
    })()
  }, [])

  const columns: ProColumns<TypeProduct>[] = [
    {
      title: '产品名称',
      dataIndex: 'name'
    },
    {
      title: '价格',
      dataIndex: 'price',
      hideInSearch: true
    },
    {
      title: '所属分类',
      dataIndex: 'category_id',
      valueEnum: categoryEnum,
      render: (_, record) => <span>{record.category !== null ? record.category?.name : ''}</span>
    },
    {
      title: '特价',
      dataIndex: 'is_special',
      valueEnum: {
        0: {
          text: '否',
          status: 'Error',
        },
        1: {
          text: '是',
          status: 'Success',
        }
      },
    },
    {
      title: '推荐',
      dataIndex: 'is_featured',
      valueEnum: {
        0: {
          text: '否',
          status: 'Error',
        },
        1: {
          text: '是',
          status: 'Success',
        }
      },
    },
    {
      title: '有效',
      dataIndex: 'is_enabled',
      valueEnum: {
        0: {
          text: '否',
          status: 'Error',
        },
        1: {
          text: '是',
          status: 'Success',
        }
      },
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
    <PageContainer className='productPage'>
      <ProTable<TypeProduct, API.PageParams>
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
              setShowCreateForm(true)
            }}
          >
            <PlusOutlined /> 新增
          </Button>,
        ]}

        request={async (
          // 第一个参数 params 查询表单和 params 参数的结合
          // 第一个参数中一定会有 pageSize 和  current ，这两个参数是 antd 的规范
          params: {
            current?: number, pageSize?: number, name?: string,
            is_enabled?: number, category_id?: string, is_featured?: number, is_special?: number
          }
        ) => {
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改

          const searchParams = {
            current_page: params.current,
            per_page: params.pageSize,
            'filter[name]': params.name,
            'filter[is_enabled]': params.is_enabled,
            'filter[is_featured]': params.is_featured,
            'filter[is_special]': params.is_special,
            'filter[category_id]': params.category_id,
            include: 'category',
          }
          const res = await listProduct(searchParams)
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

      <CreateForm
        categoryEnum={categoryEnum}
        setDescription={setDescription}
        onSubmit={async (data) => {
          console.log('收到的desc', description)
          const productData = { ...data, description_html: description?.html, description_raw: description?.raw }
          const success = await handleAdd(productData as TypeProduct)
          if (success) {
            setShowCreateForm(false)
            setCurrentRow(undefined)
            if (tableRef.current) {
              tableRef.current.reload()
            }
            return true
          } else {
            return false
          }
        }}
        onCancel={() => {
          setShowCreateForm(false)
          setCurrentRow(undefined)
        }}
        showForm={showCreateForm}
      />

      <EditForm
        categoryEnum={categoryEnum}
        onSubmit={async (data) => {
          console.log('父组件收到的', data)
          const productData = { ...data, description_html: description?.html, description_raw: description?.raw }
          const success = await handleUpdate(productData as FormValueType)
          if (success) {
            setShowEditForm(false)
            setCurrentRow(undefined)
            if (tableRef.current) {
              tableRef.current.reload()
            }
            return true
          } else {
            return false
          }
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
