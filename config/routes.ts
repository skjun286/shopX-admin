export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
        
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    component: './Admin',
    routes: [
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        icon: 'smile',
        component: './Welcome',
      },
      {
        component: './404',
      },
    ],
  },
  {
    name: 'list.table-list',
    icon: 'table',
    path: '/list',
    component: './TableList',
  },
  {
    name: 'category',
    icon: 'table',
    path: '/category',
    component: './Category/',
  },
  {
    name: 'product',
    icon: 'UnorderedListOutlined',
    path: '/product',
    // component: './Product/',
    routes: [
      {
        path: '/product/list',
        name: 'list', // name会自动带上上级的name变成product.list
        component: './product/List/',
      },
      {
        path: '/product/special',
        name: 'special',
        component: './product/Special/',
      }
    ]
  },
  {
    name: 'banner',
    path: '/banner',
    component: './Banner',
  },
  {
    name: 'coupon',
    path: '/coupon',
    component: './Coupon',
  },
  {
    name: 'users',
    icon: 'UserOutlined',
    path: '/users',
    component: './user/index',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
];
