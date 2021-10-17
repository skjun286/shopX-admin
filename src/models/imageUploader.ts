import { useCallback, useState } from 'react'

export type fileT = {
  uid: string;
  name: string;
  status: string;
  url: string
}

export interface imageUploaderModelT {
  posterPath: string;  // 主图的path 用于直接上传
  picPaths: string[];

  picsFiles: fileT[];
  posterFiles: fileT[];

  updatePicsFiles: (files: fileT[]) => void;
  updatePosterFiles: (files: fileT[]) => void;
}

export default<imageUploaderModelT> () => {
  const [posterPath, setPosterPath] = useState('') // 主图的path 用于直接上传
  const [posterFiles, setPosterFiles] = useState<fileT[]>([])
  const [picsFiles, setPicsFiles] = useState<fileT[]>([])

  // 组件调用此方法来设置files，参数可能是上传时后端返回的res也可能是通过产品id得到的res 两者参数不同
  const updatePosterFiles = useCallback(
    (files) => {
      let path = ''
      if (files.length>0) {
        const { status, response } = files[0]
        if (response && status === 'done' && response.status === 'ok') {
          // 上传时返回的res
          path = response.data
        } else {
          // 通过产品id得到的res
          path = files[0]
        }
      }
      setPosterPath(path)
      setPosterFiles(files)
    },
    [],
  )
  const [picPaths, setPicPaths] = useState<string[]>([])
  const updatePicsFiles = useCallback(
    (files) => {
      let list: string[] = []
      files.forEach((file: { status: string, response?: { status: 'ok' | 'error', data: 'string' } }) => {
        const { status, response } = file
        if (response && status === 'done' && response.status === 'ok') {
          list.push(response.data)
        } else {
          list.push()
        }
      })

      setPicPaths(list)
      setPicsFiles(files)
    },
    [],
  )
  return { posterPath, updatePosterFiles, picPaths, updatePicsFiles, picsFiles, posterFiles }
}
