import { PlusOutlined } from '@ant-design/icons'
import { Button, message, FormInstance, Switch } from 'antd'
import React, { useState, useRef } from 'react'
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout'
import type { ProColumns, ActionType } from '@ant-design/pro-table'
import ProTable from '@ant-design/pro-table'
import { ModalForm, ProFormText, ProFormSwitch, ProFormSelect, ProFormDateTimePicker, ProFormMoney, ProFormDigit } from '@ant-design/pro-form'
import {
  createCoupon, batchEnabled,
  listCoupon,
  CouponT,
  changeEnabled
} from '@/services/coupon'

const handleAdd = async (formData: any) => {
  const hide = message.loading('正在添加')
  try {
    await createCoupon(formData)
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
const handleUpdate = async (id: string, status: number) => {
  const hide = message.loading('修改中')
  try {
    await changeEnabled(id, status)
    hide()

    message.success('操作成功')
    return true
  } catch (error) {
    hide()
    message.error('操作失败，请稍后重试')
    return false
  }
}

const handleBatchStatus = async (status: number, selectedRows: CouponT[]) => {
  const hide = message.loading('正在批量设置。。。')
  if (!selectedRows) return true
  try {
    const ids = selectedRows.map(row => row.id) as string[]
    await batchEnabled(status, ids)
    hide()
    message.success('成功设置，即将刷新列表')
    return true
  } catch (error) {
    hide()
    message.error('设置失败，请重试')
    return false
  }
}

const typeEnum = {
  1: '满减',
  2: '直减',
  3: '满减%',
  4: '直减%',
}
const CouponList: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false)
  const actionRef = useRef<ActionType>()
  const createFormRef = useRef<FormInstance>()
  const [selectedRowsState, setSelectedRows] = useState<CouponT[]>([])

  const columns: ProColumns<CouponT>[] = [
    {
      title: '代码',
      dataIndex: 'code',
    },
    {
      title: '订单金额',
      dataIndex: 'order_total',
      tooltip: '当优惠类型是满减或满减%时, 需满足此项金额才可使用优惠券'
    },
    {
      title: '优惠类型',
      dataIndex: 'type',
      valueEnum: typeEnum
    },
    {
      title: '优惠数值',
      dataIndex: 'amount'
    },
    {
      title: '次数上限',
      dataIndex: 'max'
    },
    {
      title: '每个用户可用次数',
      dataIndex: 'per_user'
    },
    {
      title: '已用次数',
      dataIndex: 'used'
    },
    {
      title: '有效期(开始)',
      dataIndex: 'available_from',
      valueType: 'dateTime'
    },
    {
      title: '有效期(结束)',
      dataIndex: 'available_to',
      valueType: 'dateTime'
    },
    {
      title: '启用',
      dataIndex: 'is_enabled',
      valueEnum: {
        0: '否',
        1: '是'
      },
      render: (_, record) => {
        return <Switch defaultChecked={record.is_enabled ? true : false} onChange={(val) => { handleUpdate(record.id!, val ? 1 : 0) }} />
      },
      filters: true
    }
  ]

  return (
    <PageContainer>
      <ProTable<CouponT, API.PageParams>
        headerTitle='优惠券'
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
          const res = await listCoupon(searchParams)
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
        initialValues={{ is_enabled: 1, per_user: 1 }}
        width="600px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (data) => {
          const success = await handleAdd({ ...data, is_enabled: data.is_enabled ? 1 : 0 })
          if (success) {
            handleModalVisible(false)
            if (actionRef.current) {
              actionRef.current.reload()
            }
            createFormRef.current?.resetFields()
          }
        }}
      >
        <ProFormText name='code' label='代码' placeholder='保存后不可修改' />
        <ProFormSelect name='type' label='优惠类型' placeholder='保存后不可修改' valueEnum={typeEnum}
          // @ts-ignore
          onChange={(txt) => {
            if (txt === '2' || txt === '4') {
              createFormRef.current?.setFieldsValue({ order_total: 0 })
            } else {
              createFormRef.current?.setFieldsValue({ order_total: '' })
            }
          }}
        />
        <ProFormMoney name='order_total' label='订单金额' placeholder='保存后不可修改' tooltip='满足本金额可使用该优惠券.优惠类型是直减或直减%时, 将忽略本金额' />
        <ProFormDigit name='amount' label='优惠数值' placeholder='保存后不可修改' />
        <ProFormText name='per_user' label='每个用户可用次数' placeholder='保存后不可修改' />
        <ProFormText name='max' label='次数上限' placeholder='保存后不可修改' />

        <ProFormDateTimePicker name="available_from" label="促销开始" placeholder='保存后不可修改' />
        <ProFormDateTimePicker name="available_to" label="促销结束" placeholder='保存后不可修改' />
        <ProFormSwitch name="is_enabled" label="是否启用" />

      </ModalForm>
    </PageContainer>
  )
}

export default CouponList
