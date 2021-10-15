import React, { useState } from 'react'
import { Form, Modal } from 'antd'
import MyUploader from './MyUploader'
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
import { TypeProduct } from '@/services/product'
import { descriptionT } from '.'

export type FormValueType = {
  name?: string
  parent_id?: number
  order?: number
  is_enabled?: number
} & Partial<TypeProduct>

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void
  onSubmit: (values: FormValueType) => Promise<boolean | void>
  showForm: boolean
  categoryEnum: {}
  setDescription: (description: descriptionT) => void
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const categoryEnum = props.categoryEnum
  const [editorState, setEditorState] = useState(BraftEditor.createEditorState(null))

  const handleEditorChange = (editorState: any) => {
    const htmlString = editorState.toHTML()
    const rawString = editorState.toRAW()
    setEditorState(editorState)
    props.setDescription({
      html: htmlString,
      raw: rawString
    })
  }

  const handleSubmit = async (values: FormValueType) => {
    if (await props.onSubmit(values) === true) {
      setEditorState(BraftEditor.createEditorState(null))
      return true
    } else {
      return false
    }
  }

  return (
    <StepsForm
      stepsProps={{
        size: 'small',
      }}
      stepsFormRender={(dom, submitter) => {
        return (
          <Modal
            width={760}
            bodyStyle={{ padding: '32px 40px 48px' }}
            destroyOnClose
            title='新增产品'
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
      onFinish={handleSubmit}
    >
      <StepsForm.StepForm
        title='产品基本信息'
        initialValues={{ order: 0 }}
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
        <Form.Item valuePropName='poster' name='poster' label='主图'>
          <MyUploader />
        </Form.Item>
        <Form.Item valuePropName='pics' name='pics' label='副图'>
          <MyUploader />
        </Form.Item>

        <ProFormSwitch name="is_featured" label="是否推荐" />
        <ProFormSwitch name="is_enabled" label="是否有效" />
      </StepsForm.StepForm>
      <StepsForm.StepForm
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

      </StepsForm.StepForm>
    </StepsForm>
  )
}

export default UpdateForm
