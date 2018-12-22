.. thingsboard-xmax documentation master file, created by
   sphinx-quickstart on Wed Dec 19 21:50:12 2018.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

=====================
Thingsboard开发指南
=====================
==============
编译 修改 运行
==============
.. toctree::
   :maxdepth: 2
   :caption: Contents:

|head-img|

-----------------------------
 Clone并构建ThingsBoard仓库
-----------------------------
1. 要构建和运行ThingsBoard实例，先确保系统上安装了Java和Maven。

2. 从GitHub下载源码，下载后的本地文件路径为${TB_WORK_DIR}。

3. 以管理员模式打开cmd命令窗口
	
  .. tip:: 

    建议构建过程中所有命令窗口都使用管理员模式.
	
4. 输入指令确保所需的npm依赖项可用:

  .. code-block:: bash

    npm install -g cross-env 
    npm install -g webpack 
	
5. 使用根文件夹中的Maven工具构建，输入指令:

  .. code-block:: bash

    cd ${TB_WORK_DIR}
    mvn clean install -DskipTests
	  
  .. tip:: 

    该过程建议全程翻墙并关闭所有杀毒软件

    这一步出现的问题：
	
    1. 在各个文件夹下运行npm install报错，导致构建失败

      |error-1|
	  
      **解决方案**

      cd进入报错的文件夹中单独运行npm install指令，成功后再次尝试构建

    2. 构建过程中，出现报错xxxxx文件删除失败，导致构建失败

      **解决方案**

      打开任务管理器，关闭所有的java相关进程和node相关进程，再次尝试构建，报错原因怀疑是文件被相关进程占用导致无法删除

    3. 构建过程中，出现报错:

      .. code-block:: bash

        [ERROR] npm ERR! code ENOGIT
        [ERROR] npm ERR! No git binary found in $PATH
        [ERROR] npm ERR!
        [ERROR] npm ERR! Failed using git.
        [ERROR] npm ERR! Please check if you have git installed and in your PATH.
        [ERROR]
        [ERROR] npm ERR! A complete log of this run can be found in:
        [ERROR] Failed to execute goal
        com.github.eirslett:frontend-maven-plugin:1.0:npm (npm install) on project ui: Failed to run   task: 'npm install' failed. (error code 1) -> [Help 1]		 
	  
      **解决方案**

      安装Git或配置Git环境
	 
    4. 构建过程中，出现报错:
	
      |error-2|
	  
      出现该错误的原因是8080端口被占用。

      **解决方案**
		
      在命令窗口，输入指令找到8080端口对应的PID

      .. code-block:: bash
		  
        netstat -ano|findstr 8080
 
      |error-3|
	  
      得到对应的PID，输入指令杀死对应的进程

      .. code-block:: bash
		  
        taskkill /f /t /im 7076
 
      若该过程出现如下错误无法关闭进程，则是因为没有在管理员模式下执行命令，重新以管理员模式运行cmd，执行以上命令杀死占用端口的进程：
		  
      |error-4|
 
    5. 构建过程中，出现报错：

      |error-5|
 
      **错误原因**

      执行一遍脚本就会创建数据库执行sql语句,之前由于执行过加载数据库的操作，会生成临时数据库文件，再执行一次由于没有删除干净导致数据库文件重复所以会报错。

      **解决方案**

      找到构建过程中生成的一个temp文件夹（文件夹出现的位置应该是在构建的根目录中，如D盘，若没有，可搜索系统文件找出最新生成的temp文件夹），直接删除即可。
 
------------------------------
 IntelliJ IDEA 导入 maven项目
------------------------------
1. 导入项目
	
2. 选择项目路径
	
3. 选择maven的导入方式
	
4. 参数不需要修改，默认即可
	
5. 选择项目SDK，没有的话配置即可，即选择JDK路径
	
6. 填写项目名称
	
7. 点击确定，完成，等待导入即可
	
8. 导入成功后，运行 *ThingsboardServerApplication.java* ，打开浏览器输入 http://localhost:8080 ,开始监听8080端口，若弹出登录界面，则证明Thingsboard编译安装成功.

.. |head-img| image:: http://39.105.38.48/images/2018/10/24/Autumn_in_Kanas_by_Wang_Jinyu.jpg

.. |error-1| image:: http://39.105.38.48/images/2018/12/22/1.png

.. |error-2| image:: http://39.105.38.48/images/2018/12/22/2.png

.. |error-3| image:: http://39.105.38.48/images/2018/12/22/3.png

.. |error-4| image:: http://39.105.38.48/images/2018/12/22/4.png

.. |error-5| image:: http://39.105.38.48/images/2018/12/22/5.png

.. |error-6| image:: http://39.105.38.48/images/2018/12/22/6.png
