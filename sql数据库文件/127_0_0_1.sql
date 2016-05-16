-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: 2016-05-10 04:43:02
-- 服务器版本： 10.1.9-MariaDB
-- PHP Version: 5.6.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `projectcontrol`
--
CREATE DATABASE IF NOT EXISTS `projectcontrol` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `projectcontrol`;

-- --------------------------------------------------------

--
-- 表的结构 `equipmentcontrol`
--

CREATE TABLE `equipmentcontrol` (
  `id` int(11) NOT NULL COMMENT '自增',
  `eid` varchar(50) NOT NULL COMMENT '设备编号',
  `etype` varchar(100) NOT NULL COMMENT '设备类型',
  `ename` varchar(100) NOT NULL COMMENT '设备名称',
  `estate` varchar(6) NOT NULL COMMENT '设备状态',
  `borrowDate` text COMMENT '借出日期',
  `dueDate` text COMMENT '归还日期',
  `uname` varchar(50) NOT NULL COMMENT '借出人'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='研发设备信息表';

--
-- 转存表中的数据 `equipmentcontrol`
--

INSERT INTO `equipmentcontrol` (`id`, `eid`, `etype`, `ename`, `estate`, `borrowDate`, `dueDate`, `uname`) VALUES
(2, 'dy002', '稳压电源', 'wy305精密型稳压电源', '已借出', '2016-05-09T16:00:00.000Z', '2016-05-16T16:00:00.000Z', 'bbs'),
(3, 'dy003', '稳压电源', 'wy305精密型稳压电源', '已借出', '2016-05-04T16:00:00.000Z', '2016-05-10T16:00:00.000Z', 'jack'),
(5, 'dy005', '稳压电源', 'wy305精密型稳压电源', '可使用', '', '', ''),
(6, 'dy006', '稳压电源', '测试稳压电源', '可使用', '', '', ''),
(10, 'dy010', '稳压电源', '测试稳压电源', '可使用', '', '', ''),
(11, 'gp001', '光谱分析', 'haas2000光谱分析仪', '可使用', '', '', ''),
(12, 'gp002', '光谱分析', 'haas2000光谱分析仪', '可使用', '', '', ''),
(13, 'lum001', '光强测量', '杭州远方流明测试仪A型', '可使用', '', '', ''),
(14, 'lum002', '光强测量', '杭州远方流明测试仪A型', '可使用', '', '', ''),
(15, 'lum003', '光强测量', '杭州远方流明测试仪A型', '可使用', '', '', ''),
(16, 'lum004', '光强测量', '杭州远方流明测试仪A型', '维护中', '', '', ''),
(17, 'lum005', '光强测量', '杭州远方流明测试仪A型', '已报废', '', '', ''),
(18, 'pm001', '电量测试', '9811智能电量分析仪', '可使用', '', '', ''),
(19, 'pm002', '电量测试', '9811智能电量分析仪', '可使用', '', '', ''),
(20, 'pm003', '电量测试', '9811智能电量分析仪', '可使用', '', '', ''),
(21, 'pm004', '电量测试', '9811智能电量分析仪', '可使用', '', '', ''),
(22, 'pm005', '电量测试', '9811智能电量分析仪', '可使用', '', '', ''),
(23, 'ty001', '外电压调整', '0-300V交流调压器', '可使用', '', '', ''),
(24, 'ty002', '外电压调整', '0-300V交流调压器', '可使用', '', '', ''),
(25, 'ty003', '外电压调整', '0-300V交流调压器', '可使用', '', '', ''),
(26, 'ty004', '外电压调整', '0-300V交流调压器', '可使用', '', '', ''),
(27, 'ty005', '外电压调整', '0-300V交流调压器', '可使用', '', '', ''),
(54, 'dy004', '稳压电源', 'wy305精密稳压电源', '可使用', '', '', ''),
(55, 'dy007', '稳压电源', '精密稳压电源', '可使用', '', '', ''),
(60, 'dy009', '稳压电源', '精密稳压电源', '可使用', '', '', ''),
(62, 'dy001', '稳压电源', 'wy305精密稳压电源', '已借出', '2016-05-08T16:00:00.000Z', '2016-05-09T16:00:00.000Z', 'bbs'),
(68, 'dy111', '稳压电源', 'dsdas', '可使用', '', '', ''),
(69, 'dy011', '稳压电源', 'sasda', '可使用', '', '', ''),
(70, 'dy008', '稳压电源', '实验', '需维护', '', '', '');

-- --------------------------------------------------------

--
-- 表的结构 `users`
--

CREATE TABLE `users` (
  `uid` int(11) NOT NULL COMMENT '自动增加',
  `uname` varchar(50) NOT NULL,
  `pwd` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `admin` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `users`
--

INSERT INTO `users` (`uid`, `uname`, `pwd`, `email`, `admin`) VALUES
(1, 'knight', 'qwer', 'knight_0214@163.com', '1'),
(2, 'kk', 'qwer', 'kk@163.com', '0'),
(3, 'mark', 'qwer', 'knight_0214@163.com', '0'),
(4, 'jack', 'qwer', 'knight_0214@163.com', '0'),
(5, 'kkk', 'qwer', 'knight_0214@163.com', '0'),
(6, 'kkkk', 'qwer', 'sdada@163.com', '0'),
(7, 'asasa', 'sasasa', 'asdsd@13.com', '0'),
(8, 'k', 'kkkk', 'kkkk@163.com', '0'),
(9, 'dd', 'ssss', 'knight@163.com', '0'),
(11, 'sdsadas', 'dsada', 'sadadasds@qeeqw', '0'),
(21, 'monika', 'qwer', 'knight_0214@163.com', '0'),
(24, 'bbs', 'aswwe', 'knight_0214@163.com', '0');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `equipmentcontrol`
--
ALTER TABLE `equipmentcontrol`
  ADD PRIMARY KEY (`id`),
  ADD KEY `etype` (`etype`),
  ADD KEY `ename` (`ename`),
  ADD KEY `uname` (`uname`),
  ADD KEY `eid` (`eid`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `uname` (`uname`),
  ADD KEY `email` (`email`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `equipmentcontrol`
--
ALTER TABLE `equipmentcontrol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增', AUTO_INCREMENT=71;
--
-- 使用表AUTO_INCREMENT `users`
--
ALTER TABLE `users`
  MODIFY `uid` int(11) NOT NULL AUTO_INCREMENT COMMENT '自动增加', AUTO_INCREMENT=26;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
