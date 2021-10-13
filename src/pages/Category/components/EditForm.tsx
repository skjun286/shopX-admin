import { TypeCategory } from "@/services/category"
import ProForm, { ProFormText } from "@ant-design/pro-form"

export type FormValueType = {
  name?: string
  parent_id?: number
  order?: number
  is_enabled?: number
} & Partial<TypeCategory>

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void
  onSubmit: (values: FormValueType) => Promise<void>
  updateModalVisible: boolean
  values: Partial<TypeCategory>
}

const EditForm: React.FC<UpdateFormProps> = (props) => {
  return (
    <ProForm
      initialValues={{
        name: props.values.name,
        parent_id: props.values.parent_id,
        order: props.values.order,
        is_enabled: props.values.is_enabled
      }}
      title='修改'

    >
      <ProFormText label='标题' name='name' rules={[]} />
    </ProForm>
  )
}

export default EditForm