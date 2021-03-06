declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'numeral';
declare module '@antv/data-set';
declare module 'mockjs';
declare module 'react-fittext';
declare module 'bizcharts-plugin-slider';

// preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design Dedicated environment variable, please do not use it in your project.
declare let ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: 'site' | undefined;

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;

type LoginResult = {
  status?: string;
  data?: string;
};

type LoginParams = {
  username?: string;
  password?: string;
  autoLogin?: boolean;
};

type Token = {
  bearer: string;
  expire: number;
}

type CategoryList = {
  data: RuleListItem[];
  /** 列表的内容总数 */
  meta: {total: number};
  success: boolean;
}

type ListParams = {
  per_page?: number
  current_page?: number
  include?: string;
}
