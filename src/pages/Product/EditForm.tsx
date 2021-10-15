import React, { useEffect, useRef, useState } from 'react'
import { Form, FormInstance, Modal } from 'antd'
import {
  ProFormSelect,
  ProFormText,
  ProFormSwitch,
  StepsForm,
  ProFormMoney
} from '@ant-design/pro-form'
// 引入富文本编辑器
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/index.css'

import { getProductionDescription, TypeProduct } from '@/services/product'
import { descriptionT } from '.'

export type FormValueType = {
  name?: string
  parent_id?: number
  order?: number
  is_enabled?: number
} & Partial<TypeProduct>

export type EditFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void
  onSubmit: (values: FormValueType) => Promise<boolean | void>
  showForm: boolean
  values: Partial<TypeProduct>
  categoryEnum: {}
  setDescription: (description: descriptionT) => void
}

const EditForm: React.FC<EditFormProps> = (props) => {
  const [editorState, setEditorState] = useState(BraftEditor.createEditorState(null))

  const [current, setCurrent] = useState(0)
  const step1Ref = useRef<FormInstance>()
  const step2Ref = useRef<FormInstance>()
  const categoryEnum = props.categoryEnum
  useEffect(() => {
    if (props.values.id) {
      (async () => {
        const res = await getProductionDescription(props.values.id!)
        setCurrent(0)

        step1Ref.current?.setFieldsValue(props.values)
        step2Ref.current?.setFieldsValue({ id: props.values.id })
        setEditorState(BraftEditor.createEditorState(res.data))
      })()

    }
  }, [props.values.id])

  const handleEditorChange = (editorState: any) => {
    const htmlString = editorState.toHTML()
    const rawString = editorState.toRAW()
    setEditorState(editorState)
    props.setDescription({
      html: htmlString,
      raw: rawString
    })
  }
  return (
    <StepsForm
      current={current}
      onCurrentChange={(currentStep) => setCurrent(currentStep)}
      stepsProps={{
        size: 'small',
      }}
      stepsFormRender={(dom, submitter) => {
        return (
          <Modal
            width={780}
            bodyStyle={{ padding: '32px 40px 48px' }}
            destroyOnClose
            title='修改产品'
            visible={props.showForm}
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
        formRef={step1Ref}
        title='产品基本信息'
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
          rules={[
            { required: true, message: '必选' }
          ]}
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
        formRef={step2Ref}
        title='产品描述'
      >
        <Form.Item className='descriptionEditorWrap' valuePropName='description' name="description" label="产品描述" rules={[{ required: true },
        () => ({
          validator(_, value) {
            // console.log('dddd', value.toText())
            if (value.toText() !== '') {
              return Promise.resolve()
            }
            return Promise.reject(new Error('产品描述为必填'))
          },
        }),
        ]}>
          <BraftEditor
            className='descriptionEditor'
            controls={[
              'undo', 'redo', 'separator',
              'font-size', 'line-height', 'letter-spacing', 'separator',
              'text-color', 'bold', 'italic', 'underline', 'strike-through', 'separator',
              'superscript', 'subscript', 'remove-styles', 'separator', 'text-indent', 'text-align', 'separator',
              'headings', 'list-ul', 'list-ol', 'blockquote', 'code', 'separator',
              'link', 'separator', 'hr', 'separator',
              'media', 'separator',
              'clear'
            ]}
            value={editorState}
            onChange={handleEditorChange}
          />
        </Form.Item>

        <ProFormText hidden name="id" />


      </StepsForm.StepForm>
    </StepsForm>
  )
}

export default EditForm
