# cli工具——concc

#### 安装
```
snpm i -g check-cycle-complexity

```
+ `version` 产看concc版本号
+  `sr` 代码圈复杂度统计（show result简写）

#### version
```
concc version //显示concc版本
```

#### sr
> 默认统计当前cmd目录
```
// 默认统计 圈复杂度>1
concc sr
// --min 过滤圈复杂度
concc sr --min=10 
```
### 结果展示

![markdown](http://assets.ytuj.cn/img/Snipaste_2019-12-16_13-59-46.png)

------------

![avatar](http://assets.ytuj.cn/img/Snipaste_2019-12-16_14-00-01.png)




> note: 仅支持 js，vue，jsx 文件，默认过滤当前目录下的 node_moudles dist build output common_build 文件夹
