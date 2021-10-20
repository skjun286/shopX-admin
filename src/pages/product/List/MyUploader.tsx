import { Upload, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getItem } from '@/utils/storage'
import { useModel } from 'umi'
import { fileT, imageUploaderModelT } from '@/models/imageUploader'
import { useState } from 'react'
import { apiBase } from '@/config'

function getBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

type MyUploaderProps = {
  type: 'avatar' | 'poster' | 'pics'  // 头像|主图|副图
  max: number
  files: fileT[]
}

const MyUploader: React.FC<MyUploaderProps> = (props) => {
  const [previewImage, setPreviewImage] = useState('')
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewTitle, setPreviewTitle] = useState('')
  // @ts-ignore
  const model: imageUploaderModelT = useModel('imageUploader')

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImage(file.url || file.preview)
    setPreviewVisible(true)
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1))
  }

  const handleChange = ({ fileList }: { fileList: any }) => {
    if (type === 'poster') {
      model.updatePosterFiles(fileList)
    } else {
      model.updatePicsFiles(fileList)
    }

  }

  const token = getItem('token') as Token
  const { type, max } = props
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>选择上传</div>
    </div>
  )

  return (
    <>
      <Upload
        action={`${apiBase}/tool/image`}
        headers={{ Authorization: `Bearer ${token.bearer}` }}
        data={{ type }}
        listType="picture-card"
        // @ts-ignore
        fileList={type === 'poster' ? model.posterFiles : model.picsFiles}
        onPreview={handlePreview}
        onChange={handleChange}
        accept='image/*'
      >
        {type === 'poster' ?
          model.posterFiles.length >= max ? null : uploadButton
          : model.picsFiles.length >= max ? null : uploadButton
        }
      </Upload>
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  )
}

export default MyUploader
