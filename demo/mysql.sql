-- 创建数据库
CREATE DATABASE `user` CHARACTER SET utf8 COLLATE utf8_general_ci;

-- 授权操作
GRANT ALL ON `user`.* TO `username`@localhost IDENTIFIED BY 'password';
FLUSH PRIVILEGES;

-- 用户表
CREATE TABLE `user_info` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'user_id',
  `username` varchar(32) NOT NULL DEFAULT '' COMMENT '用户名',
  `phone` varchar(16) NOT NULL DEFAULT '' COMMENT '手机号',
  `email` varchar(32) NOT NULL DEFAULT '' COMMENT '邮件',
  `ga` varchar(32) NOT NULL DEFAULT '' COMMENT 'Google 验证码',
  `idcard` varchar(32) NOT NULL DEFAULT '' COMMENT '身份证',
  `passport` varchar(32) NOT NULL DEFAULT '' COMMENT '护照',
  `vip` int(11) unsigned NOT NULL DEFAULT 1 COMMENT '用户等级',
  `created` timestamp(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3) COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;
