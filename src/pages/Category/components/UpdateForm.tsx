import React, { useEffect, useState } from 'react'
import { Modal } from 'antd'
import {
  ProFormSelect,
  ProFormText,
  ProFormSwitch,
  StepsForm,
  ProFormMoney,
  ProFormTextArea,
} from '@ant-design/pro-form'

import { getProductionDescription, TypeProduct } from '@/services/product'

export type FormValueType = {
  name?: string
  parent_id?: number
  order?: number
  is_enabled?: number
} & Partial<TypeProduct>

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void
  onSubmit: (values: FormValueType) => Promise<void>
  updateModalVisible: boolean
  values: Partial<TypeProduct>
  categoryEnum: {}
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const categoryEnum = props.categoryEnum
  const [description, setDescription] = useState('')
  useEffect(() => {
    (async () => {
      const res = await getProductionDescription(props.values.id!)
      console.log(res)
      setDescription(res.data)
    })()

  }, [])
  return (
    <StepsForm
      stepsProps={{
        size: 'small',
      }}
      stepsFormRender={(dom, submitter) => {
        return (
          <Modal
            width={640}
            bodyStyle={{ padding: '32px 40px 48px' }}
            destroyOnClose
            title='修改产品'
            visible={props.updateModalVisible}
            footer={submitter}
            onCancel={() => {
              props.onCancel()
            }}
          >
            {dom}
          </Modal>
        )
      }}
      onFinish={props.onSubmit}
    >
      <StepsForm.StepForm
        title='产品基本信息'
        initialValues={{
          id: props.values.id,
          name: props.values.name,
          price: props.values.price,
          order: props.values.order,
          is_featured: props.values.is_featured,
          is_enabled: props.values.is_enabled,
        }}
      >
        <ProFormText
          label='名称'
          name="name"
          width="md"
          rules={[
            {
              required: true,
              message: '必填',
            },
          ]}
        />
        <ProFormMoney
          label='价格'
          name="price"
          width="md"
          rules={[
            {
              required: true,
              message: '必填',
            },
          ]}
        />
        <ProFormSelect
          label="所属分类"
          showSearch
          name="category_id"
          valueEnum={categoryEnum}
        />
        <ProFormText
          label='排序值'
          name="order"
          width="md"
          rules={[
            {
              required: true,
              message: '必填',
            },
          ]}
        />
        <ProFormText hidden name="id" />
        <ProFormSwitch name="is_featured" label="是否推荐" />
        <ProFormSwitch name="is_enabled" label="是否有效" />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        initialValues={{ description, id: props.values.id }}
        title='产品描述'
      >
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入描述"
        />
        <ProFormText hidden name="id" />


      </StepsForm.StepForm>
    </StepsForm>
  )
}

export default UpdateForm
