import { PlusOutlined } from '@ant-design/icons'
import { Button, message, FormInstance, Form, Input, Image } from 'antd'
import React, { useState, useRef } from 'react'
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout'
import type { ProColumns, ActionType } from '@ant-design/pro-table'
import ProTable from '@ant-design/pro-table'
import { ModalForm, ProFormText, ProFormSwitch, ProFormSelect, ProFormTextArea } from '@ant-design/pro-form'
import {
  createBanner, updateBanner, batchRemoveBanner, batchStatus, removeBanner,
  listBanner,
  BannerT
} from '@/services/banner'
import { listProduct, ProductT } from '@/services/product'

const handleAdd = async (formData: any) => {
  const hide = message.loading('正在添加')
  try {
    await createBanner(formData)
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
const handleUpdate = async (fields: BannerT) => {
  const hide = message.loading('修改中')
  try {
    await updateBanner(fields.id!, fields)
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
const handleRemove = async (selectedRows: BannerT[]) => {
  const hide = message.loading('正在删除')
  if (!selectedRows) return true
  try {
    const ids = selectedRows.map(row => row.id) as string[]
    await batchRemoveBanner(ids)
    hide()
    message.success('成功删除，即将刷新列表')
    return true
  } catch (error) {
    hide()
    message.error('删除失败，请重试')
    return false
  }
}
const handleBatchStatus = async (status: number, selectedRows: BannerT[]) => {
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
const handleRemove1 = async (row: BannerT) => {
  const hide = message.loading('正在删除')

  try {
    await removeBanner(row.id!)
    hide()
    message.success('成功删除，即将刷新列表')
    return true
  } catch (error) {
    hide()
    message.error('删除失败，请重试')
    return false
  }
}

const BannerList: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [editFormImage, setEditFormImage] = useState('')
  const actionRef = useRef<ActionType>()
  const createFormRef = useRef<FormInstance>()
  const editFormRef = useRef<FormInstance>()
  const [selectedRowsState, setSelectedRows] = useState<BannerT[]>([])

  const columns: ProColumns<BannerT>[] = [
    {
      title: '所属产品',
      dataIndex: 'product_id',
      render: (_, record) => <span>{record.product?.name}</span>
    },
    {
      title: '广告图',
      className: 'bannerImage',
      dataIndex: 'path',
      valueType: 'image'
    },
    {
      title: '广告标题',
      dataIndex: 'title',
    },
    {
      title: '广告语',
      dataIndex: 'description',
    },
    {
      title: '启用',
      dataIndex: 'is_enabled',
      valueEnum: {
        0: '否',
        1: '是'
      },
      filters: true
    },
    {
      title: '排序值',
      dataIndex: 'order',
      sorter: true,
      hideInSearch: true
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
            setEditFormImage(record.path)
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
      <ProTable<BannerT, API.PageParams>
        headerTitle='横幅广告'
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
          params,
          sort,
          filter
        ) => {
          let searchParams = { ...params }
          searchParams.include = 'product'
          if (sort) {
            let arr = []
            for (const key in sort) {
              if (Object.prototype.hasOwnProperty.call(sort, key)) {
                const element = sort[key]
                if (element === 'ascend') {
                  arr.push(key)
                } else {
                  arr.push('-' + key)
                }
              }
            }
            const sortStr = arr.join(',')
            // @ts-ignore
            searchParams.sort = sortStr
          }
          console.log(filter)
          if (filter) {
            for (const key in filter) {
              if (Object.prototype.hasOwnProperty.call(filter, key)) {
                const arr = filter[key] as [] | null
                if (arr !== null) {
                  searchParams[`filter[${key}]`] = arr.join(',')
                }
              }
            }
          }
          const res = await listBanner(searchParams)
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
        initialValues={{ is_enabled: 1, order: 0 }}
        width="600px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          // console.log(value.pic.target.files[0])
          const formData = new FormData()
          formData.append('pic', value.pic.target.files[0])
          formData.append('product_id', value.product_id)
          formData.append('title', value.title)
          formData.append('order', value.order)
          formData.append('description', value.description)
          formData.append('is_enabled', value.is_enabled) // 上面的initialValues中设置is_enabled这个switch的值为1以后 得到的值就不是true或false而是1或0了
          const success = await handleAdd(formData)
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
          label="所属产品"
          // todo 改成本地数据后 search改成过滤本地数据
          request={async ({ keyword }) => {
            let params = {
              'filter[is_enabled]': 0,
            }
            if (keyword) {
              params['filter[name]'] = keyword
            }
            // @ts-ignore
            const res = await listProduct(params)
            const options = res.data.map((item: ProductT) => ({ label: item.name, value: item.id, price: item.price }))
            return options
          }}
        />

        <Form.Item rules={[{ required: true, message: '请上传广告图' }]} valuePropName='pic' name='pic' label='广告图'>
          <Input type='file' />
        </Form.Item>

        <ProFormText name='title' label='广告标题' />
        <ProFormTextArea name='description' label='广告语' />
        <ProFormSwitch name="is_enabled" label="是否启用" />
        <ProFormText name='order' label='排序值' />

      </ModalForm>
      {/* 修改的modal表单 */}
      <ModalForm
        formRef={editFormRef}
        title='修改'
        width="600px"
        visible={showEditModal}
        onVisibleChange={setShowEditModal}
        onFinish={async (value) => {
          const success = await handleUpdate({ ...value, is_enabled: value.is_enabled === true ? 1 : 0 })
          if (success) {
            setShowEditModal(false)
            if (actionRef.current) {
              actionRef.current.reload()
            }
            editFormRef.current?.resetFields()
          }
        }}
      >

        <ProFormSelect
          showSearch
          name="product_id"
          label="所属产品"
          // todo 改成本地数据后 search改成过滤本地数据
          request={async ({ keyword }) => {
            let params = {
              'filter[is_enabled]': 0,
            }
            if (keyword) {
              params['filter[name]'] = keyword
            }
            // @ts-ignore
            const res = await listProduct(params)
            const options = res.data.map((item: ProductT) => ({ label: item.name, value: item.id, price: item.price }))
            return options
          }}
        />


        <Image
          width={200}
          height={200}
          src={editFormImage}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
        />

        <Form.Item valuePropName='pic' name='pic' label='广告图'>
          <Input type='file' />
        </Form.Item>

        <ProFormText name='title' label='广告标题' />
        <ProFormTextArea name='description' label='广告语' />
        <ProFormSwitch name="is_enabled" label="是否启用" />
        <ProFormText name='order' label='排序值' />
        <ProFormText hidden name="id" />
      </ModalForm>

    </PageContainer>
  )
}

export default BannerList
