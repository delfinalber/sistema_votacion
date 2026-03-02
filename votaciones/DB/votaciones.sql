-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-03-2026 a las 17:42:48
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `votaciones`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `adminstrador`
--

CREATE TABLE `adminstrador` (
  `id_administrador` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `usuario_admin` varchar(100) NOT NULL,
  `password_admin` varchar(100) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

--
-- Volcado de datos para la tabla `adminstrador`
--

INSERT INTO `adminstrador` (`id_administrador`, `nombre`, `usuario_admin`, `password_admin`, `fecha`) VALUES
(1, 'alber delfin peña ortigoza', 'rosa123', 'rosa123', '2026-03-01 22:42:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `candidatos`
--

CREATE TABLE `candidatos` (
  `id_candidato` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `numero` varchar(50) DEFAULT NULL,
  `cargo` varchar(100) NOT NULL,
  `foto` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `candidatos`
--

INSERT INTO `candidatos` (`id_candidato`, `nombre`, `numero`, `cargo`, `foto`) VALUES
(7, 'MAURICIO LEAL', '1', 'Personero', 'Votaciones/Img/candidato_1772414395_69a4e5bbf1d5c.jpeg'),
(8, 'JOSE CELESTINO MUTIS', '2', 'Personero', 'Votaciones/Img/candidato_1772414422_69a4e5d6e26a6.jpg'),
(9, 'HUGO RODALLEGA', '1', 'Contralor', 'Votaciones/Img/candidato_1772414466_69a4e6026a1ba.jpeg'),
(10, 'SILVESTRE DANGOUT', '2', 'Contralor', 'Votaciones/Img/candidato_1772414559_69a4e65fd2c33.jpeg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `usuario` int(11) NOT NULL,
  `paasword` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `usuario`, `paasword`, `nombre`) VALUES
(1, 12345, 'delfin12345', 'alber delfin peña ortigoza'),
(2, 123, 'tata123', 'santiago peña yague');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `votantes`
--

CREATE TABLE `votantes` (
  `id_votante` varchar(50) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `voto_realizado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `votantes`
--

INSERT INTO `votantes` (`id_votante`, `nombre`, `voto_realizado`) VALUES
('1006110901', 'Valeria Torres Silva', 0),
('1006110902', 'Sebastián Arias', 0),
('1006110903', 'Gabriela Flores Mendoza', 0),
('1006110904', 'Alejandro Vega Ortiz', 0),
('1006110905', 'Luciana Paredes Cruz', 0),
('1006111001', 'Camila Díaz Morales', 0),
('1006111002', 'Santiago Moreno Jiménez', 0),
('1006111003', 'Isabella Romero Vargas', 0),
('1006111004', 'Mateo Castillo Castro', 0),
('1006111101', 'Ana María López', 1),
('1006111102', 'Juan Carlos Rodríguez', 0),
('1006111103', 'Sofía Martínez Pérez', 0),
('1006111104', 'Luis Alberto García', 0),
('1006111105', 'Valentina Gómez Sánchez', 0),
('1006111106', 'Daniel Hernández Ruiz', 0),
('1029888675', 'kenssy Alexandra', 0),
('1072662379', 'Danna Chinchia Quintanilla', 0),
('1075217491', 'Maria Paula Gonzales', 1),
('1075252300', 'Luz Elena Polania', 0),
('1075795095', 'Martin Julian Torres', 0),
('1075796670', 'Juan David', 0),
('1076511048', 'Juan Jose Perdomo Gonzales', 0),
('10766911001', 'Juan Paulo', 0),
('1077232828', 'JHON EDISON BASTIDAS BETANCUR', 1),
('1077235045', 'Mariana Isabela Ramirez', 0),
('1077246156', 'Angela Victoria Ortega', 0),
('1077725987', 'fabian quintero', 0),
('1121913362', 'Jean Carlos AVENDAÑO', 0),
('1122677802', 'Stefanny Lorena Quintero', 0),
('1145725934', 'Sofia gamboa', 0),
('12345', 'ALBER DELFIN PEÑA ORTIGOZA', 0),
('1234567891', 'pamela', 0),
('1586248598', 'Maria Paula', 0),
('7722975', 'luz elena', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `votos`
--

CREATE TABLE `votos` (
  `id_voto` int(11) NOT NULL,
  `id_candidato` int(11) NOT NULL,
  `id_votante` varchar(50) NOT NULL,
  `es_blanco` tinyint(1) NOT NULL,
  `valor_voto` int(1) NOT NULL,
  `fecha_voto` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

--
-- Volcado de datos para la tabla `votos`
--

INSERT INTO `votos` (`id_voto`, `id_candidato`, `id_votante`, `es_blanco`, `valor_voto`, `fecha_voto`) VALUES
(43, 0, '1077232828', 1, 1, '2026-03-02 16:27:34'),
(44, 10, '1077232828', 0, 1, '2026-03-02 16:27:34'),
(45, 7, '1075217491', 0, 1, '2026-03-02 16:28:32'),
(46, 0, '1075217491', 1, 1, '2026-03-02 16:28:32'),
(47, 8, '1006111101', 0, 1, '2026-03-02 16:30:01'),
(48, 10, '1006111101', 0, 1, '2026-03-02 16:30:01');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `adminstrador`
--
ALTER TABLE `adminstrador`
  ADD PRIMARY KEY (`id_administrador`);

--
-- Indices de la tabla `candidatos`
--
ALTER TABLE `candidatos`
  ADD PRIMARY KEY (`id_candidato`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`);

--
-- Indices de la tabla `votantes`
--
ALTER TABLE `votantes`
  ADD PRIMARY KEY (`id_votante`);

--
-- Indices de la tabla `votos`
--
ALTER TABLE `votos`
  ADD PRIMARY KEY (`id_voto`),
  ADD KEY `id_candidato_2` (`id_candidato`),
  ADD KEY `id_votante_2` (`id_votante`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `adminstrador`
--
ALTER TABLE `adminstrador`
  MODIFY `id_administrador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `candidatos`
--
ALTER TABLE `candidatos`
  MODIFY `id_candidato` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `votos`
--
ALTER TABLE `votos`
  MODIFY `id_voto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
