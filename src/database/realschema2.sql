-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 20, 2025 at 11:13 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hrdatabase`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `department` enum('IT','Finance','Sales','Customer-Service') DEFAULT NULL,
  `video_url` varchar(255) NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `video_type` enum('youtube','other') DEFAULT 'youtube',
  `duration` varchar(50) DEFAULT NULL,
  `difficulty` enum('Beginner','Intermediate','Advanced') DEFAULT 'Beginner'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_certificates`
--

CREATE TABLE `course_certificates` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `issue_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `certificate_url` varchar(255) DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT NULL,
  `quiz_score` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_enrollments`
--

CREATE TABLE `course_enrollments` (
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `progress` int(11) DEFAULT 0 CHECK (`progress` >= 0 and `progress` <= 100),
  `completed` tinyint(1) DEFAULT 0,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_interactions`
--

CREATE TABLE `course_interactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `interaction_type` enum('play','pause','seek','complete_segment','complete_course') DEFAULT NULL,
  `interaction_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `video_position` int(11) DEFAULT NULL,
  `segment_id` varchar(50) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_quizzes`
--

CREATE TABLE `course_quizzes` (
  `id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `passing_score` int(11) DEFAULT 70,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_quiz_attempts`
--

CREATE TABLE `course_quiz_attempts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `quiz_id` int(11) DEFAULT NULL,
  `attempt_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `score` int(11) DEFAULT NULL,
  `passed` tinyint(1) DEFAULT 0,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`answers`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_quiz_questions`
--

CREATE TABLE `course_quiz_questions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) DEFAULT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('multiple_choice','true_false','short_answer') DEFAULT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `correct_answer` text DEFAULT NULL,
  `points` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_watch_history`
--

CREATE TABLE `course_watch_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `watch_date` date DEFAULT NULL,
  `watch_duration` int(11) DEFAULT NULL,
  `watch_start_time` timestamp NULL DEFAULT NULL,
  `watch_end_time` timestamp NULL DEFAULT NULL,
  `watch_position` int(11) DEFAULT NULL,
  `completed_segments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`completed_segments`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_course_demonstrations`
--

CREATE TABLE `employee_course_demonstrations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_name` longtext NOT NULL,
  `project_title` longtext NOT NULL,
  `project_description` text DEFAULT NULL,
  `document_url` longtext DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_course_demonstrations`
--

INSERT INTO `employee_course_demonstrations` (`id`, `user_id`, `course_name`, `project_title`, `project_description`, `document_url`, `submitted_at`) VALUES
(1, 5, 'President Donald Trump on Tuesday threatened to strip “large scale federal funding” from California if the state goes against his executive order banning transgender athletes from participating in women’s sports.  That funding could be withheld “permanently” if California continues to flout the Feb. 5 order, Trump warned on Truth Social.  The president’s post complained that a trans athlete who qualified to compete against women in an upcoming competition is “practically unbeatable.”  He wrote that he will order “local authorities, if necessary, to not allow the transitioned person to compete in the State Finals.”  Trump added that he will speak with California Gov. Gavin Newsom, a Democrat, later Tuesday “to find out which way he wants to go” on the issue.  Trump did not name the athlete whose participation in women’s sports drew his ire. AB Hernandez, a California high school student and transgender athlete competing in girls track and field, has recently received media attention.  Trump’s threat to shut off federal funding could be significant for California, the world’s fourth-largest economy.  Over one-third of the state’s budget comes from the federal government, according to the California Budget and Policy Center. The state’s 2025-2026 budget includes more than $170 billion in federal funds.  The threat also carries weight in light of Trump’s increasing willingness to cancel billions of dollars in federal funds to universities, cities and other entities whose whose conduct he opposes.  Read more CNBC politics coverage Trump administration moves to cut rest of Harvard contracts with federal government NPR sues Trump over executive order cutting federal funding Trump delays 50% tariffs on EU to July 9 GOP senators rip into House budget bill over deficit concerns House Speaker Johnson downplays deficit concerns as budget bill faces skeptics in Senate Trump touts changes to military in campaign-style West Point graduation address Judge blocks Trump DOGE plans for mass firing of federal workers Harvard sues Trump administration over ban on international student enrollment View More Earlier Tuesday, Trump moved to cancel all remaining federal government contracts with Harvard University — reportedly totaling roughly $100 million — in the administration’s latest salvo against the elite institution.  Trump has previously threatened to withhold federal funds from Maine over the state’s compliance with Trump’s executive order barring transgender women and girls from participating in female sports.  Newsom, widely seen as a contender for the 2028 Democratic presidential nomination, has been a vocal critic of a number of Trump policies, including on tariffs and immigration.  He downplayed the debate over trans athletes in April, saying the issue has been “weaponized by the right to be 10x, 100x bigger than it is.”  But he also suggested in March that trans athletes participating in girls’ and women’s sports was “deeply unfair,” separating himself from many of his fellow Democrats.  “I think it’s an issue of fairness. I completely agree with you on that,” Newsom told conservative influencer Charlie Kirk on his podcast.  Newsom’s office did not immediately provide a comment in response to Trump’s post.  WATCH LIVESTREAM Prefer to Listen? NOW Closing Bell UP NEXT Closing Bell Trending Now Traders work on the floor of the New York Stock Exchange during morning trading on May 27, 2025 in New York City. Dow climbs 700 points on EU tariff delay, consumer confidence surge Jensen Huang, co-founder and CEO of Nvidia Corp., speaks during a news conference in Taipei on May 21, 2025.  All eyes on China restrictions as Nvidia gets set to report results  I’m a psychologist who studies couples—5 things people in the happiest relationships do on weekends doxo ranked the most and least expensive states based on the cost of monthly household bills. The most—and least—expensive U.S. states based on the median monthly costs of household bills  I’ve studied over 200 kids—there’s a new parenting style that ‘works better than the rest’ by TaboolaSponsored Links FROM THE WEB American Investor Warren Buffett Recommends: 5 Books For Turning Your Life Around Blinkist: Warren Buffett’s Reading List FROM CNBC My longtime favorite stock is now the name I am most worried about Navigating the bond market during the volatility Woman shot at CIA headquarters after crashing into gate Pres. Trump is \'asking for the impossible\' with his 25% iPhone tariff threat: Barton Crockett Shares of China\'s BYD continue to tumble following price cuts Smead: The U.S. is living American exceptionalism on borrowed money FROM THE WEB The Killer New Toyota RAV4 Is Utter Perfection (Take A Look) TheDaddest:Sponsored The Killer New Toyota 4Runner Is Utter Perfection (Take A Look) MorninJoy:Sponsored Play War Thunder now for free War Thunder:Sponsored MORE IN POLITICS Trump administration moves to cut rest of Harvard contracts with federal government Dan Mangan6 NPR sues Trump over executive order cutting federal funding Kevin Breuninger6 Harvard blocked by Trump administration from enrolling international students Dan Mangan Supreme Court insulates Fed board while backing Trump firing of agency leaders Dan Mangan', 'President Donald Trump on Tuesday threatened to strip “large scale federal funding” from California if the state goes against his executive order banning transgender athletes from participating in women’s sports.  That funding could be withheld “permanently” if California continues to flout the Feb. 5 order, Trump warned on Truth Social.  The president’s post complained that a trans athlete who qualified to compete against women in an upcoming competition is “practically unbeatable.”  He wrote that he will order “local authorities, if necessary, to not allow the transitioned person to compete in the State Finals.”  Trump added that he will speak with California Gov. Gavin Newsom, a Democrat, later Tuesday “to find out which way he wants to go” on the issue.  Trump did not name the athlete whose participation in women’s sports drew his ire. AB Hernandez, a California high school student and transgender athlete competing in girls track and field, has recently received media attention.  Trump’s threat to shut off federal funding could be significant for California, the world’s fourth-largest economy.  Over one-third of the state’s budget comes from the federal government, according to the California Budget and Policy Center. The state’s 2025-2026 budget includes more than $170 billion in federal funds.  The threat also carries weight in light of Trump’s increasing willingness to cancel billions of dollars in federal funds to universities, cities and other entities whose whose conduct he opposes.  Read more CNBC politics coverage Trump administration moves to cut rest of Harvard contracts with federal government NPR sues Trump over executive order cutting federal funding Trump delays 50% tariffs on EU to July 9 GOP senators rip into House budget bill over deficit concerns House Speaker Johnson downplays deficit concerns as budget bill faces skeptics in Senate Trump touts changes to military in campaign-style West Point graduation address Judge blocks Trump DOGE plans for mass firing of federal workers Harvard sues Trump administration over ban on international student enrollment View More Earlier Tuesday, Trump moved to cancel all remaining federal government contracts with Harvard University — reportedly totaling roughly $100 million — in the administration’s latest salvo against the elite institution.  Trump has previously threatened to withhold federal funds from Maine over the state’s compliance with Trump’s executive order barring transgender women and girls from participating in female sports.  Newsom, widely seen as a contender for the 2028 Democratic presidential nomination, has been a vocal critic of a number of Trump policies, including on tariffs and immigration.  He downplayed the debate over trans athletes in April, saying the issue has been “weaponized by the right to be 10x, 100x bigger than it is.”  But he also suggested in March that trans athletes participating in girls’ and women’s sports was “deeply unfair,” separating himself from many of his fellow Democrats.  “I think it’s an issue of fairness. I completely agree with you on that,” Newsom told conservative influencer Charlie Kirk on his podcast.  Newsom’s office did not immediately provide a comment in response to Trump’s post.  WATCH LIVESTREAM Prefer to Listen? NOW Closing Bell UP NEXT Closing Bell Trending Now Traders work on the floor of the New York Stock Exchange during morning trading on May 27, 2025 in New York City. Dow climbs 700 points on EU tariff delay, consumer confidence surge Jensen Huang, co-founder and CEO of Nvidia Corp., speaks during a news conference in Taipei on May 21, 2025.  All eyes on China restrictions as Nvidia gets set to report results  I’m a psychologist who studies couples—5 things people in the happiest relationships do on weekends doxo ranked the most and least expensive states based on the cost of monthly household bills. The most—and least—expensive U.S. states based on the median monthly costs of household bills  I’ve studied over 200 kids—there’s a new parenting style that ‘works better than the rest’ by TaboolaSponsored Links FROM THE WEB American Investor Warren Buffett Recommends: 5 Books For Turning Your Life Around Blinkist: Warren Buffett’s Reading List FROM CNBC My longtime favorite stock is now the name I am most worried about Navigating the bond market during the volatility Woman shot at CIA headquarters after crashing into gate Pres. Trump is \'asking for the impossible\' with his 25% iPhone tariff threat: Barton Crockett Shares of China\'s BYD continue to tumble following price cuts Smead: The U.S. is living American exceptionalism on borrowed money FROM THE WEB The Killer New Toyota RAV4 Is Utter Perfection (Take A Look) TheDaddest:Sponsored The Killer New Toyota 4Runner Is Utter Perfection (Take A Look) MorninJoy:Sponsored Play War Thunder now for free War Thunder:Sponsored MORE IN POLITICS Trump administration moves to cut rest of Harvard contracts with federal government Dan Mangan6 NPR sues Trump over executive order cutting federal funding Kevin Breuninger6 Harvard blocked by Trump administration from enrolling international students Dan Mangan Supreme Court insulates Fed board while backing Trump firing of agency leaders Dan Mangan', 'President Donald Trump on Tuesday threatened to strip “large scale federal funding” from California if the state goes against his executive order banning transgender athletes from participating in women’s sports.\r\n\r\nThat funding could be withheld “permanently” if California continues to flout the Feb. 5 order, Trump warned on Truth Social.\r\n\r\nThe president’s post complained that a trans athlete who qualified to compete against women in an upcoming competition is “practically unbeatable.”\r\n\r\nHe wrote that he will order “local authorities, if necessary, to not allow the transitioned person to compete in the State Finals.”\r\n\r\nTrump added that he will speak with California Gov. Gavin Newsom, a Democrat, later Tuesday “to find out which way he wants to go” on the issue.\r\n\r\nTrump did not name the athlete whose participation in women’s sports drew his ire. AB Hernandez, a California high school student and transgender athlete competing in girls track and field, has recently received media attention.\r\n\r\nTrump’s threat to shut off federal funding could be significant for California, the world’s fourth-largest economy.\r\n\r\nOver one-third of the state’s budget comes from the federal government, according to the California Budget and Policy Center. The state’s 2025-2026 budget includes more than $170 billion in federal funds.\r\n\r\nThe threat also carries weight in light of Trump’s increasing willingness to cancel billions of dollars in federal funds to universities, cities and other entities whose whose conduct he opposes.\r\n\r\nRead more CNBC politics coverage\r\nTrump administration moves to cut rest of Harvard contracts with federal government\r\nNPR sues Trump over executive order cutting federal funding\r\nTrump delays 50% tariffs on EU to July 9\r\nGOP senators rip into House budget bill over deficit concerns\r\nHouse Speaker Johnson downplays deficit concerns as budget bill faces skeptics in Senate\r\nTrump touts changes to military in campaign-style West Point graduation address\r\nJudge blocks Trump DOGE plans for mass firing of federal workers\r\nHarvard sues Trump administration over ban on international student enrollment\r\nView More\r\nEarlier Tuesday, Trump moved to cancel all remaining federal government contracts with Harvard University — reportedly totaling roughly $100 million — in the administration’s latest salvo against the elite institution.\r\n\r\nTrump has previously threatened to withhold federal funds from Maine over the state’s compliance with Trump’s executive order barring transgender women and girls from participating in female sports.\r\n\r\nNewsom, widely seen as a contender for the 2028 Democratic presidential nomination, has been a vocal critic of a number of Trump policies, including on tariffs and immigration.\r\n\r\nHe downplayed the debate over trans athletes in April, saying the issue has been “weaponized by the right to be 10x, 100x bigger than it is.”\r\n\r\nBut he also suggested in March that trans athletes participating in girls’ and women’s sports was “deeply unfair,” separating himself from many of his fellow Democrats.\r\n\r\n“I think it’s an issue of fairness. I completely agree with you on that,” Newsom told conservative influencer Charlie Kirk on his podcast.\r\n\r\nNewsom’s office did not immediately provide a comment in response to Trump’s post.\r\n\r\nWATCH LIVESTREAM\r\nPrefer to Listen?\r\nNOW\r\nClosing Bell\r\nUP NEXT\r\nClosing Bell\r\nTrending Now\r\nTraders work on the floor of the New York Stock Exchange during morning trading on May 27, 2025 in New York City.\r\nDow climbs 700 points on EU tariff delay, consumer confidence surge\r\nJensen Huang, co-founder and CEO of Nvidia Corp., speaks during a news conference in Taipei on May 21, 2025. \r\nAll eyes on China restrictions as Nvidia gets set to report results\r\n\r\nI’m a psychologist who studies couples—5 things people in the happiest relationships do on weekends\r\ndoxo ranked the most and least expensive states based on the cost of monthly household bills.\r\nThe most—and least—expensive U.S. states based on the median monthly costs of household bills\r\n\r\nI’ve studied over 200 kids—there’s a new parenting style that ‘works better than the rest’\r\nby TaboolaSponsored Links\r\nFROM THE WEB\r\nAmerican Investor Warren Buffett Recommends: 5 Books For Turning Your Life Around\r\nBlinkist: Warren Buffett’s Reading List\r\nFROM CNBC\r\nMy longtime favorite stock is now the name I am most worried about\r\nNavigating the bond market during the volatility\r\nWoman shot at CIA headquarters after crashing into gate\r\nPres. Trump is \'asking for the impossible\' with his 25% iPhone tariff threat: Barton Crockett\r\nShares of China\'s BYD continue to tumble following price cuts\r\nSmead: The U.S. is living American exceptionalism on borrowed money\r\nFROM THE WEB\r\nThe Killer New Toyota RAV4 Is Utter Perfection (Take A Look)\r\nTheDaddest:Sponsored\r\nThe Killer New Toyota 4Runner Is Utter Perfection (Take A Look)\r\nMorninJoy:Sponsored\r\nPlay War Thunder now for free\r\nWar Thunder:Sponsored\r\nMORE IN POLITICS\r\nTrump administration moves to cut rest of Harvard contracts with federal government\r\nDan Mangan6\r\nNPR sues Trump over executive order cutting federal funding\r\nKevin Breuninger6\r\nHarvard blocked by Trump administration from enrolling international students\r\nDan Mangan\r\nSupreme Court insulates Fed board while backing Trump firing of agency leaders\r\nDan Mangan', NULL, '2025-05-27 19:21:19'),
(2, 5, 'Economy', 'Economy Progression', 'Cambridge IGCSE\r\n™\r\n0455/11\r\nMay/June 2023\r\n45 minutes\r\nECONOMICS\r\nPaper 1 Multiple Choice\r\nYou must answer on the multiple choice answer sheet.\r\nYou will need: Multiple choice answer sheet\r\nSoft clean eraser\r\nSoft pencil (type B or HB is recommended)\r\nINSTRUCTIONS\r\n• There are thirty questions on this paper. Answer all questions.\r\n• For each question there are four possible answers A, B, C and D. Choose the one you consider correct\r\nand record your choice in soft pencil on the multiple choice answer sheet.\r\n• Follow the instructions on the multiple choice answer sheet.\r\n• Write in soft pencil.\r\n• Write your name, centre number and candidate number on the multiple choice answer sheet in the\r\nspaces provided unless this has been done for you.\r\n• Do not use correction fluid.\r\n• Do not write on any bar codes.\r\n• You may use a calculator.\r\nINFORMATION\r\n• The total mark for this paper is 30.\r\n• Each correct answer will score one mark.\r\n• Any rough working should be done on this question paper.\r\nThis document has 12 pages. Any blank pages are indicated.\r\n[Turn over\r\n06_0455_11_2023_1.12\r\n© UCLES 2023\r\n*9846344773*\r\n1 What is the cause of scarcity in an economy?\r\nA high employment levels\r\nB high investment levels\r\nC unlimited resources\r\nD unlimited wants\r\n2 What does a point on a production possibility curve for an economy represent?\r\nA economic growth is falling\r\nB inefficient use of resources available\r\nC maximum output possible with current technology\r\nD total demand for goods and services\r\n3 What is most likely to increase enterprise as a factor of production in an economy?\r\nA a decrease in government spending on education\r\nB a decrease in regulation on firms\r\nC an increase in emigration\r\nD an increase in taxation on firms\r\n4 Which economic activity would be classified as macroeconomics?\r\nA households spend less on holidays abroad\r\nB income tax is increased by the government\r\nC wages rise for construction workers\r\nD world coffee price rises due to poor weather\r\n© UCLES 2023 06_0455_11_2023_1.12\r\n2\r\n5 The diagram shows the effect of a decrease in price on the demand for a product.\r\nprice\r\nP1\r\nQ1 Q2\r\nP2\r\nO\r\nquantity\r\ndemanded\r\nD\r\nD\r\nWhat does the arrow on the diagram illustrate?\r\nA contraction in demand\r\nB decrease in demand\r\nC extension in demand\r\nD increase in demand\r\n6 What is the correct formula to calculate price elasticity of supply?\r\nA the percentage change in price divided by the change in quantity supplied\r\nB the percentage change in price divided by the percentage change in quantity supplied\r\nC the percentage change in quantity supplied divided by the change in price\r\nD the percentage change in quantity supplied divided by the percentage change in price\r\n7 What is the most likely cause of a product having a price elasticity of demand greater than one?\r\nA The product has a close substitute.\r\nB The product is a habit-forming good.\r\nC The product is a necessity.\r\nD The product requires only a small proportion of consumer income.\r\n[Turn over © UCLES 2023 06_0455_11_2023_1.12\r\n3\r\nFor some illnesses, wearing a face mask has a benefit as it could prevent people from getting\r\ninfected. Not all people are willing to wear face masks.\r\nBased on the statement above, why would there be an inefficient allocation of face masks in the\r\nfree market?\r\n8\r\nA Consumers in the free market only consider private costs and benefits.\r\nB Face masks are non-rival and non-excludable.\r\nC There is abuse of monopoly power by the producer of face masks.\r\nD There is perfect information in the free market.\r\n9 What would bring about a movement upwards along the supply curve for rice?\r\nA a decrease in the productivity of farmworkers\r\nB a decrease in the profitability of rice production\r\nC an increase in consumers’ incomes\r\nD an increase in farmworkers’ wages\r\nA government decides to reduce air pollution in city centres by giving financial assistance to bus\r\ncompanies, reducing their costs of production and prices for passengers.\r\nWhich type of policy measure is this?\r\n10\r\nA a maximum price\r\nB a minimum price\r\nC a subsidy\r\nD regulation\r\n11 What would be least likely to act as a store of value during a period of rapid inflation?\r\nA cash\r\nB gold\r\nC property\r\nD shares\r\n© UCLES 2023 06_0455_11_2023_1.12\r\n4\r\nA country’s central bank raised the rate of interest from 1% to 4% per year.\r\nHow would this change have affected the amount saved and the cost of borrowing by individuals?\r\n12\r\ncost of\r\nborrowing\r\namount\r\nsaved\r\nA decreased decreased\r\nB decreased increased\r\nC increased decreased\r\nD increased increased\r\n13 Which factor would not increase the bargaining strength of a trade union to raise wages?\r\nA a rapidly growing economy\r\nB high union membership in the industry\r\nC legislation limiting strike action\r\nD workers are in short supply\r\n14 Which conditions are most likely to attract small firms to enter a market?\r\nfixed costs of\r\nentering the\r\nindustry\r\nthe market for\r\nthe product\r\nA local high\r\nB local low\r\nC national high\r\nD national low\r\n[Turn over © UCLES 2023 06_0455_11_2023_1.12\r\n5\r\n15 The diagram shows a firm’s total cost (TC) curve.\r\n0\r\n10\r\n50\r\n10\r\nTC\r\ncost\r\n$\r\nunits of output\r\nWhat is the average variable cost if the firm produces 10 units of output?\r\nA $4 B $5 C $40 D $50\r\nThe table shows the units of factors of production that a firm needs to employ for two different levels\r\nof output.\r\n16\r\nland labour capital output\r\n5 2 4 100\r\n10 4 8 150\r\nWhat is the firm experiencing?\r\nA constant returns to scale\r\nB diseconomies of scale\r\nC external diseconomies of scale\r\nD external economies of scale\r\n17 What is an example of a government macroeconomic aim?\r\nA a minimum of 10 years of schooling\r\nB a sales tax of 10% on consumer goods\r\nC a target rate of 2% inflation\r\nD increasing pay for nurses\r\n© UCLES 2023 06_0455_11_2023_1.12\r\n6\r\nGovernment policy measures can affect economic activity in a country.\r\nWhich pair of monetary policy measures would be likely to increase employment?\r\n18\r\nA depreciate foreign exchange rates and increase education spending\r\nB increase money supply and reduce interest rates\r\nC provide subsidies and grants and lower sales tax\r\nD reduce income tax and improve infrastructure\r\n19 What would be most likely to encourage saving?\r\nA a rise in the exchange rate\r\nB a rise in the goods and services tax rate\r\nC a rise in the income tax rate\r\nD a rise in the interest rate\r\nThe government of a country operating at full employment increases its spending on education and\r\ntraining.\r\nHow does this affect the likelihood of achieving low inflation in the short run and the long run?\r\n20\r\nshort run long run\r\nA less likely less likely\r\nB less likely more likely\r\nC more likely less likely\r\nD more likely more likely\r\n[Turn over © UCLES 2023 06_0455_11_2023_1.12\r\n7\r\nA government has introduced a tax on a necessity. Producers have passed on a large proportion\r\nof this tax to consumers in the form of higher prices.\r\nWhich row is correct?\r\n21\r\nprice elasticity\r\nof demand type of tax\r\nA direct price elastic\r\nB direct price inelastic\r\nC indirect price elastic\r\nD indirect price inelastic\r\n22 What is most likely to lead to an increase in structural unemployment in a country?\r\nA The country is experiencing a period of negative economic growth.\r\nB The country is experiencing a period of positive economic growth.\r\nC The country is moving from producing primary sector goods to secondary sector goods.\r\nD The country is moving towards more flexible labour markets.\r\n23 Which citizens are most likely to benefit in a period of rapid inflation?\r\nA citizens who are receiving fixed state benefits\r\nB citizens who earn fixed incomes\r\nC citizens who have lent money at a fixed rate of interest\r\nD citizens who have borrowed money at a fixed rate of interest\r\n24 Which statement is correct about the Human Development Index (HDI) and real GDP?\r\nA HDI includes exports and imports while real GDP does not.\r\nB HDI includes life expectancy and years of schooling while real GDP does not.\r\nC HDI includes the level of output while real GDP does not.\r\nD HDI includes the level of unemployment in the population while real GDP does not.\r\n© UCLES 2023 06_0455_11_2023_1.12\r\n8\r\n25 Other things being equal, what will cause a population both to increase and to age?\r\nA a fall in the birth rate\r\nB a fall in the death rate\r\nC a rise in both the birth rate and the death rate\r\nD a rise in the death rate and a fall in the birth rate\r\n26 Which change would be unlikely to be found in a country as it develops?\r\nA an increase in average incomes and a decrease in unemployment\r\nB an increase in manufacturing production and an increase in shipping services\r\nC an increase in subsistence farming and a decrease in financial services\r\nD an increase in tourism and an increase in the export of agricultural products\r\nIt is cheaper for developed economies to buy some cereals from developing economies than to\r\nproduce them domestically.\r\nWhat might reduce international trade in cereals?\r\n27\r\nA Cereals become less popular with the population of developing economies.\r\nB Developed economies place an embargo on cereal imports to prevent disease.\r\nC Governments tax cereal production in developed economies.\r\nD Producers of cereals in developing economies are subsidised.\r\nA country imposes a quota on imported cars.\r\nWhat is the most likely outcome of this action?\r\n28\r\nA a decrease in the domestic output of cars\r\nB a decrease in the domestic price of cars\r\nC an increase in the tax revenue from car imports\r\nD an increase in the total revenue of domestic car producers\r\n[Turn over © UCLES 2023 06_0455_11_2023_1.12\r\n9\r\nAn Argentine product initially sells in the US for $50 when the exchange rate between the two\r\ncountries is 5 pesos to 1 dollar.\r\nThe exchange rate changes to 10 pesos to 1 dollar and the price of the product remains unchanged\r\nin Argentina.\r\nWhat will be the new price of the product in the US?\r\n29\r\nA $5 B $25 C $100 D $500\r\nWhich policy measure is most likely to reduce the current account deficit of the balance of payments\r\nof an economy?\r\n30\r\nA decrease the level of subsidies to domestic producers\r\nB increase infrastructure spending to increase domestic productivity\r\nC increase interest rates\r\nD remove import tariffs\r\n© UCLES 2023 06_0455_11_2023_1.12\r\n10\r\nBLANK PAGE\r\n© UCLES 2023 06_0455_11_2023_1.12\r\n11\r\nBLANK PAGE\r\nPermission to reproduce items where third-party owned material protected by copyright is included has been sought and cleared where possible. Every reasonable\r\neffort has been made by the publisher (UCLES) to trace copyright holders, but if any items requiring clearance have unwittingly been included, the publisher will\r\nbe pleased to make amends at the earliest possible opportunity.\r\nTo avoid the issue of disclosure of answer-related information to candidates, all copyright acknowledgements are reproduced online in the Cambridge Assessment\r\nInternational Education Copyright Acknowledgements Booklet. This is produced for each series of examinations and is freely available to download at\r\nwww.cambridgeinternational.org after the live examination series.\r\nCambridge Assessment International Education is part of Cambridge Assessment. Cambridge Assessment is the brand name of the University of Cambridge Local\r\nExaminations Syndicate (UCLES), which is a department of the University of Cambridge.\r\n© UCLES 2023 06_0455_11_2023_1.12\r\n12', NULL, '2025-05-28 16:59:21');

-- --------------------------------------------------------

--
-- Table structure for table `job_applications`
--

CREATE TABLE `job_applications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `cover_letter` text DEFAULT NULL,
  `cv_url` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Reviewed','Accepted','Rejected') DEFAULT 'Pending',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `job_title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_applications`
--

INSERT INTO `job_applications` (`id`, `user_id`, `cover_letter`, `cv_url`, `status`, `submitted_at`, `job_title`) VALUES
(3, 5, 'I want this job', '/uploads/cvs/5_1750449754_Employee_Compass_Add-ins.docx', 'Pending', '2025-06-20 20:02:34', 'Devops Job ');

-- --------------------------------------------------------

--
-- Table structure for table `job_opportunities`
--

CREATE TABLE `job_opportunities` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `department` enum('IT','Finance','Sales','Customer-Service') DEFAULT NULL,
  `description` text NOT NULL,
  `posted_by` int(11) DEFAULT NULL,
  `posted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deadline` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_required_skills`
--

CREATE TABLE `job_required_skills` (
  `job_id` int(11) NOT NULL,
  `skill_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `response` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `user_id`, `type`, `start_date`, `end_date`, `reason`, `status`, `response`, `submitted_at`) VALUES
(1, 5, 'Sick', '2025-06-27', '2025-06-30', 'Let me leave boy ', 'Rejected', NULL, '2025-06-20 18:37:21'),
(2, 5, 'Sick', '2025-07-16', '2025-07-23', 'uiwruiwrh', 'Approved', NULL, '2025-06-20 18:37:59');

-- --------------------------------------------------------

--
-- Table structure for table `login_sessions`
--

CREATE TABLE `login_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_agent` text NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `logout_time` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_sessions`
--


--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `type` enum('task','course','job','general') NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `title`, `message`, `user_id`, `is_read`, `type`, `link`, `created_at`) VALUES
(2, 'New Task Assigned', 'You have been assigned a new task', '1', 0, 'task', '/tasks/1', '2025-05-23 19:09:45'),
(3, 'Course Completed', 'Congratulations on completing the course!', '2', 0, 'course', '/courses/2', '2025-05-23 19:09:45'),
(4, 'Deadline Reminder', 'Task deadline is approaching', '3', 0, 'task', '/tasks/3', '2025-05-23 19:09:45'),
(5, 'New Course Available', 'A new course is available for your department', '4', 0, 'course', '/courses/4', '2025-05-23 19:09:45'),
(6, 'Task Update', 'Task status has been updated', '5', 0, 'task', '/tasks/5', '2025-05-23 19:09:45'),
(7, 'Achievement Unlocked', 'You have earned a new achievement', '6', 0, '', '/profile', '2025-05-23 19:09:45'),
(8, 'Team Meeting', 'Team meeting scheduled for tomorrow', '7', 0, '', '/calendar', '2025-05-23 19:09:45'),
(10, 'Course Progress', 'You are 90% complete with your course', '1', 0, 'course', '/courses/9', '2025-05-23 19:09:45'),
(11, 'Task Completed', 'Great job on completing the task!', '2', 0, 'task', '/tasks/10', '2025-05-23 19:09:45'),
(12, 'new message', 'Take care guys', '1', 0, 'course', NULL, '2025-05-23 20:19:17'),
(13, 'A new job for you guys', 'We have a new role for backend engineers', '1', 0, 'job', NULL, '2025-05-24 20:19:34');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(255) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `title`, `description`, `file_url`, `uploaded_by`, `department`, `assigned_to`, `created_at`) VALUES
(1, 'Quiz One ', 'TestPassword123!', '/uploads/quizzes/1750452872_Employee_Compass_Add-ins.docx', 3, 'Finance', 5, '2025-06-20 20:54:32'),
(2, 'TestPassword123!', 'TestPassword123!', '/uploads/quizzes/1750453419_Employee_Compass_Add-ins.docx', 3, 'Finance', 5, '2025-06-20 21:03:39');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_submissions`
--

CREATE TABLE `quiz_submissions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_submissions`
--

INSERT INTO `quiz_submissions` (`id`, `quiz_id`, `user_id`, `file_url`, `submitted_at`) VALUES
(1, 1, 5, '/uploads/quiz_submissions/1_5_1750453208_Employee_Compass_Add-ins.docx', '2025-06-20 21:00:08');

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `level` enum('Beginner','Intermediate','Advanced') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `documentation` text DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `status` enum('Todo','In Progress','Completed') NOT NULL,
  `progress` int(11) DEFAULT NULL CHECK (`progress` >= 0 and `progress` <= 100),
  `deadline` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `documentation`, `assigned_to`, `assigned_by`, `status`, `progress`, `deadline`, `created_at`, `updated_at`) VALUES
(3, 'cdhsuicdhsd', 'sdihcidhsd', 'In progress', 5, 3, 'Todo', 12, '2025-06-20 20:02:05', '2025-05-19 20:49:43', '2025-06-20 20:02:05'),
(24, 'Implement New Authentication System', 'Upgrade the current authentication system to use OAuth 2.0', 'I am done with the documentation', 10, 2, 'Completed', 92, '2025-05-24 20:47:26', '2025-05-20 08:00:00', '2025-05-24 20:47:26'),
(25, 'Database Optimization', 'Optimize database queries and indexes for better performance', 'https://docs.example.com/db-optimization', 11, 2, 'Todo', 0, '2025-06-19 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(26, 'Q2 Financial Report Preparation', 'Prepare detailed financial reports for Q2 2025', 'https://docs.example.com/q2-reports', 5, 3, 'Completed', 100, '2025-05-28 19:01:20', '2025-05-20 08:00:00', '2025-05-28 19:01:20'),
(28, 'New Product Launch Strategy', 'Develop marketing and sales strategy for new product launch', 'https://docs.example.com/product-launch', 7, 6, 'In Progress', 60, '2025-06-24 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(29, 'Customer Feedback Analysis', 'Analyze and compile customer feedback from recent surveys', 'https://docs.example.com/feedback-analysis', 7, 6, 'Todo', 0, '2025-06-14 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(30, 'Service Quality Improvement', 'Implement new customer service quality metrics', 'https://docs.example.com/service-quality', 9, 8, 'In Progress', 30, '2025-06-29 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(31, 'Customer Support Training', 'Organize training session for new customer support protocols', 'https://docs.example.com/support-training', 9, 8, 'Todo', 0, '2025-06-19 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(33, 'edwejd', 'wefwejfkwefi wfiojwef weofwpf ', NULL, 21, 6, 'Todo', 0, '2025-05-30 20:00:00', '2025-05-27 13:58:17', '2025-05-27 13:58:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Admin','TeamLeader','Employee') NOT NULL,
  `department` enum('Admin','IT','Finance','Sales','Customer-Service') DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `skill_level` enum('Beginner','Intermediate','Advanced') DEFAULT NULL,
  `experience` int(11) DEFAULT NULL,
  `experience_level` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `profile_image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `department`, `phone_number`, `skill_level`, `experience`, `experience_level`, `description`, `profile_image_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'John Jerry', 'admin@gmail.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Admin', 'IT', '234-567-8901', 'Advanced', 5, 1, 'I am the main system Administrator', '', 1, '2025-05-14 15:00:59', '2025-05-24 20:29:36'),
(2, 'Jill Wagner Joe', 'jillwagner@gmail.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'IT', '+250123456789', 'Intermediate', 4, 4, 'IT Team Leader', NULL, 1, '2025-05-14 15:00:59', '2025-05-26 19:02:34'),
(3, 'Fina Niicer', 'teamlead.finance@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'Finance', '234-567-8901', 'Advanced', 4, 2, 'Finance Team Leaders', NULL, 1, '2025-05-14 15:00:59', '2025-05-28 17:00:08'),
(5, 'Jerry Jane', 'employee.finance@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Finance', '+1234567893', 'Advanced', 2, 1, 'Finance Department Employee', NULL, 1, '2025-05-14 15:00:59', '2025-06-20 16:10:09'),
(6, 'Team Leader Sales', 'teamlead.sales@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'Sales', '+1234567895', 'Advanced', 4, 2, 'Sales Team Leader', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 15:56:57'),
(7, 'Sales Employee', 'employee.sales@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Sales', '+1234567896', 'Intermediate', 2, 1, 'Sales Department Employee', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 15:57:09'),
(8, 'Team Leader Customer-Service', 'teamlead.customerservice@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'Customer-Service', '+1234567897', 'Advanced', 4, 2, 'Customer Service Team Leader', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 15:59:33'),
(9, 'Gary Jerry', 'employee.customerservice@hrms.com', 'pbkdf2:sha256:260000$YVhfBsgZd329O9wN$8d7556fb2af24e08817c3c89b1361707bc8e2af4cda5c4215be6de1f68fa98b6', 'Employee', 'Customer-Service', '234-567-8901', 'Intermediate', 2, 1, 'Customer Service Department Employee', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 16:45:38'),
(10, 'Brian Joe', 'brian@gmal.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '+250123456789', 'Beginner', 0, NULL, 'None', NULL, 1, '2025-05-16 11:04:06', '2025-05-19 15:57:19'),
(11, 'big boss', 'manzidavquion@gmail.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '234-567-8901', 'Intermediate', 10, NULL, 'He is courageous', NULL, 1, '2025-05-19 15:12:38', '2025-05-19 15:57:31'),
(14, 'Jill Wagner Joe', 'teamlead.iTt@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'IT', '+250123456789', 'Intermediate', 4, 4, 'IT Team Leader', NULL, 1, '2025-05-14 15:00:59', '2025-05-15 19:29:02'),
(15, 'John Smith', 'john.smith@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '+1234567890', 'Intermediate', 3, 2, 'Full-stack developer with React and Node.js experience', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(16, 'Sarah Johnson', 'sarah.j@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Finance', '+1234567891', '', 5, 3, 'Financial analyst with expertise in risk management', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(17, 'Mike Wilson', 'mike.w@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Sales', '+1234567892', 'Advanced', 1, 1, 'Sales representative with strong communication skills', NULL, 1, '2025-05-23 19:05:36', '2025-06-20 16:06:45'),
(18, 'Lisa Brown', 'lisa.b@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Customer-Service', '+1234567893', 'Intermediate', 2, 2, 'Customer service specialist with 2 years experience', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(19, 'David Lee', 'david.l@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '+1234567894', 'Intermediate', 4, 3, 'Backend developer with Python and Django expertise', NULL, 1, '2025-05-23 19:05:36', '2025-06-20 16:00:41'),
(20, 'Emma Davis', 'emma.d@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Finance', '+1234567895', 'Intermediate', 2, 2, 'Accountant with CPA certification', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(21, 'James Wilson', 'james.w@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Sales', '+1234567896', '', 6, 3, 'Sales manager with proven track record', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(22, 'Maria Garcia', 'maria.g@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Customer-Service', '+1234567897', '', 1, 1, 'Customer support representative', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(23, 'Tom Anderson', 'tom.a@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'IT', '+1234567898', '', 7, 3, 'IT Team Leader with 7 years of experience', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(24, 'Rachel Chen', 'rachel.c@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'Finance', '+1234567899', '', 8, 3, 'Finance Team Leader with MBA', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(25, 'Titi brown', 'Titibrown@gmail.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'IT', NULL, 'Beginner', NULL, NULL, 'A well performing employee', NULL, 1, '2025-05-24 20:15:04', '2025-05-27 14:39:05');

-- --------------------------------------------------------

--
-- Table structure for table `user_skills`
--

CREATE TABLE `user_skills` (
  `user_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_courses_department` (`department`);

--
-- Indexes for table `course_certificates`
--
ALTER TABLE `course_certificates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_enrollments`
--
ALTER TABLE `course_enrollments`
  ADD PRIMARY KEY (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_interactions`
--
ALTER TABLE `course_interactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_quizzes`
--
ALTER TABLE `course_quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_quiz_attempts`
--
ALTER TABLE `course_quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- Indexes for table `course_quiz_questions`
--
ALTER TABLE `course_quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- Indexes for table `course_watch_history`
--
ALTER TABLE `course_watch_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `employee_course_demonstrations`
--
ALTER TABLE `employee_course_demonstrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `job_opportunities`
--
ALTER TABLE `job_opportunities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `posted_by` (`posted_by`);

--
-- Indexes for table `job_required_skills`
--
ALTER TABLE `job_required_skills`
  ADD PRIMARY KEY (`job_id`,`skill_name`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `login_sessions`
--
ALTER TABLE `login_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_login_sessions_user_id` (`user_id`),
  ADD KEY `idx_login_sessions_login_time` (`login_time`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user_id` (`user_id`),
  ADD KEY `idx_notifications_created_at` (`created_at`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_id` (`quiz_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_tasks_status` (`status`),
  ADD KEY `idx_tasks_assigned_to` (`assigned_to`),
  ADD KEY `idx_tasks_deadline` (`deadline`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_department` (`department`),
  ADD KEY `idx_users_email` (`email`);

--
-- Indexes for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD PRIMARY KEY (`user_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_certificates`
--
ALTER TABLE `course_certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_interactions`
--
ALTER TABLE `course_interactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_quizzes`
--
ALTER TABLE `course_quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_quiz_attempts`
--
ALTER TABLE `course_quiz_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_quiz_questions`
--
ALTER TABLE `course_quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_watch_history`
--
ALTER TABLE `course_watch_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_course_demonstrations`
--
ALTER TABLE `employee_course_demonstrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `job_opportunities`
--
ALTER TABLE `job_opportunities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `login_sessions`
--
ALTER TABLE `login_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=233;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `course_certificates`
--
ALTER TABLE `course_certificates`
  ADD CONSTRAINT `course_certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_certificates_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_enrollments`
--
ALTER TABLE `course_enrollments`
  ADD CONSTRAINT `course_enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_interactions`
--
ALTER TABLE `course_interactions`
  ADD CONSTRAINT `course_interactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_interactions_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_quizzes`
--
ALTER TABLE `course_quizzes`
  ADD CONSTRAINT `course_quizzes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_quiz_attempts`
--
ALTER TABLE `course_quiz_attempts`
  ADD CONSTRAINT `course_quiz_attempts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_quiz_attempts_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `course_quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_quiz_questions`
--
ALTER TABLE `course_quiz_questions`
  ADD CONSTRAINT `course_quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `course_quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_watch_history`
--
ALTER TABLE `course_watch_history`
  ADD CONSTRAINT `course_watch_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_watch_history_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_course_demonstrations`
--
ALTER TABLE `employee_course_demonstrations`
  ADD CONSTRAINT `employee_course_demonstrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD CONSTRAINT `job_applications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `job_opportunities`
--
ALTER TABLE `job_opportunities`
  ADD CONSTRAINT `job_opportunities_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `job_required_skills`
--
ALTER TABLE `job_required_skills`
  ADD CONSTRAINT `job_required_skills_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `job_opportunities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `login_sessions`
--
ALTER TABLE `login_sessions`
  ADD CONSTRAINT `login_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`);

--
-- Constraints for table `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  ADD CONSTRAINT `quiz_submissions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`),
  ADD CONSTRAINT `quiz_submissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD CONSTRAINT `user_skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;