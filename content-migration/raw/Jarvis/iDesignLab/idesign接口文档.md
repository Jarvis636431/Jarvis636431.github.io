查看作品详情接口：
http://idesign.tju.edu.cn/portal/api_v1/get_design_detail?category_id={$cate_id}&id={$id}
帮我用curl测试这个接口获取作品列表接口：http://idesign.tju.edu.cn/portal/api_v1/get_cates_lists?per_page=9999&current_page=1&category_id={$cate_id，见下文}

https://www.figma.com/design/bZvr9H2hVsoMMcmcY44eSc/Untitled?node-id=0-1&t=mKhqJa0pMBloWQVj-1

https://www.figma.com/proto/bZvr9H2hVsoMMcmcY44eSc/Untitled?node-id=0-1&t=mKhqJa0pMBloWQVj-1

需要调整的细节：
分享透卡 视差滚动 展厅切换的路径 滚动逻辑 几个页面的样式

bug文档：
1.移动端，没有返回上一个页面的按钮
2.缺少facicon.ico
3.小地图位置，样式，移动端没地方放
4.有人的视频没有封面，分享按钮生成的透卡无法展示
5.展场模型2仍然有问题，测试页面，如果点击消失的场景会卡死，因为不可视导致界面无法交互
6.移动端设计浏览器布局问题，下方的地址栏会遮挡
7.移动端透视窗口什么效果？
8.点击跳转和滑动跳转的区别
9.初始动画和首尾相接的动画问题