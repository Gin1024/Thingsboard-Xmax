.. thingsboard-xmax documentation master file, created by
   sphinx-quickstart on Wed Dec 19 21:50:12 2018.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

=======================
Thingsboard开发指南
=======================
===============
编译 修改 运行
===============
.. toctree::
   :maxdepth: 2
   :caption: Contents:

|head-img| 

--------
环境配置
--------
- Java

.. code-block:: bash

  $ sudo add-apt-repository ppa:webupd8team/java
  $ sudo apt-get update
  $ sudo apt-get install oracle-java8-installer

- Maven

.. code-block:: bash
 
  $ sudo apt-get install mvn

- git

.. code-block:: bash

  $ sudo apt-get install git
  $ git config --global user.name "name"
  $ git config --global user.email "email"

---------------
Clone并构建源码
---------------
.. code-block:: bash

  $ git clone https://github.com/thingsboard/thingsboard.git
  $ cd thingsboard
  $ mvn clean install -DskipTests

------------
初始化数据库
------------
.. code-block:: bash

  $ cd thingsboard/application/target/bin/install
  $ chmod +x install_dev_db.sh
  $ ./install_dev_db.sh

.. note::

  - 注意修改/log文件夹权限
  
  - 重新初始化数据库需删除/tmp文件夹

------------
运行开发环境
------------
~~~~~~~~
导入IDEA
~~~~~~~~
将项目导入IDEA

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
以热插拔模式运行UI容器 (可选)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. code-block:: bash

  $ cd thingsboard/ui
  $ mvn clean install -P npm-start

~~~~~~~~~~~~~~
运行服务端容器
~~~~~~~~~~~~~~
1. 运行 *org.thingsboard.server.ThingsboardServerApplication* class.

2. 运行jar包.

.. code-block:: bash

  $ cd thingsboard
  $ java -jar application/target/thingsboard-${VERSION}-boot.jar

----
访问
----
浏览器访问 http://localhost:3000/ (UI容器) 或者 http://localhost:8080/,并用以下账号密码登录

- *login* **tenant@thingsboard.org**

- *password* **tenant**

----
验证
----
在更改代码后,你需要验证改变是否符合预期需求.

.. code-block:: bash

  $ cd thingsboard
  $ mvn clean install

确保构建良好并且测试成功.

----
引用
----
| Thingsboard贡献指南_
| RST语法文档_
	
.. _Thingsboard贡献指南: https://thingsboard.io/docs/user-guide/contribution/how-to-contribute/
.. _RST语法文档: https://3vshej.cn/rstSyntax/rstSyntax.html

.. |head-img| image:: http://39.105.38.48/images/2018/10/24/Autumn_in_Kanas_by_Wang_Jinyu.jpg
