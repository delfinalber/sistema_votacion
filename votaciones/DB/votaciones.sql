-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-03-2026 a las 22:10:35
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
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `id_administrador` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `usuario_admin` varchar(100) NOT NULL,
  `password_admin` varchar(100) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

--
-- Volcado de datos para la tabla `administrador`
--

INSERT INTO `administrador` (`id_administrador`, `nombre`, `usuario_admin`, `password_admin`, `fecha`) VALUES
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
-- Estructura de tabla para la tabla `registro_mesa`
--

CREATE TABLE `registro_mesa` (
  `id_registro_mesa` int(11) NOT NULL,
  `nombre_profe` varchar(100) NOT NULL,
  `materia_profe` varchar(100) NOT NULL,
  `puesto_votacion` varchar(10) NOT NULL,
  `telefono_profe` bigint(12) NOT NULL,
  `nombre_estudiante` varchar(100) NOT NULL,
  `grado_estudiante` varchar(10) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

--
-- Volcado de datos para la tabla `registro_mesa`
--

INSERT INTO `registro_mesa` (`id_registro_mesa`, `nombre_profe`, `materia_profe`, `puesto_votacion`, `telefono_profe`, `nombre_estudiante`, `grado_estudiante`, `fecha`) VALUES
(1, 'INGRESO TEST_INGRESO', 'INGRESO', 'N/A', 0, 'N/A', 'N/A', '2026-03-02 20:34:17'),
(2, 'Profesor Prueba', 'Matemáticas', 'Mesa 1', 3000000000, 'Jurado Prueba', '11-A', '2026-03-02 20:34:20');

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
('1006110902', 'Sebastián Arias', 0),
('1006110903', 'Gabriela Flores Mendoza', 0),
('1006110905', 'Luciana Paredes Cruz', 0),
('1006111001', 'Camila Díaz Morales', 0),
('1006111002', 'Santiago Moreno Jiménez', 0),
('1006111003', 'Isabella Romero Vargas', 0),
('1006111004', 'Mateo Castillo Castro', 0),
('1006111101', 'Ana María López', 0),
('1006111102', 'Juan Carlos Rodríguez', 0),
('1006111103', 'Sofía Martínez Pérez', 0),
('1006111104', 'Luis Alberto García', 0),
('1006111105', 'Valentina Gómez Sánchez', 0),
('1006111106', 'Daniel Hernández Ruiz', 0),
('1029888675', 'kenssy Alexandra', 0),
('1072662379', 'Danna Chinchia Quintanilla', 0),
('1075217491', 'Maria Paula Gonzales', 0),
('1075252300', 'Luz Elena Polania', 0),
('1075795095', 'Martin Julian Torres', 0),
('1075796670', 'Juan David', 0),
('1076511048', 'Juan Jose Perdomo Gonzales', 0),
('10766911001', 'Juan Paulo', 0),
('1077232828', 'JHON EDISON BASTIDAS BETANCUR', 0),
('1077235045', 'Mariana Isabela Ramirez', 0),
('1077246156', 'Angela Victoria Ortega', 0),
('1077725987', 'fabian quintero', 0),
('1121913362', 'Jean Carlos AVENDAÑO', 0),
('1122677802', 'Stefanny Lorena Quintero', 0),
('1145725934', 'Sofia gamboa', 0),
('123456789', 'ALBER DELFIN PEÑA ORTIGOZA', 1),
('1234567891', 'pamela', 0),
('1586248598', 'Maria Paula', 0),
('1627832407', 'Camila Navarro', 0),
('1801207382', 'Felipe Ortega', 0),
('1815446425', 'Diana Ortega', 0),
('2132009779', 'Mateo Molina', 0),
('2145882331', 'Mateo Molina', 0),
('2403364610', 'Sergio Ruiz', 0),
('2554534701', 'Isabella Méndez', 0),
('2568472440', 'Isabella Navarro', 0),
('2766834543', 'Ana Torres', 0),
('2868759843', 'Sofía López', 0),
('2953725146', 'Sofía Ortega', 0),
('3284055678', 'Andrés Molina', 0),
('3289738583', 'Valentina Ramírez', 0),
('3482199578', 'María Ortega', 0),
('3503268108', 'Paula Pérez', 0),
('3777727578', 'Juan Méndez', 0),
('3837178564', 'Valentina Herrera', 0),
('3869735219', 'Sofía Pérez', 0),
('3978080105', 'Luis Navarro', 0),
('4169338792', 'Julián Silva', 0),
('4376610225', 'Diana López', 0),
('4604760086', 'Felipe Navarro', 0),
('4625154099', 'Julián Ortega', 0),
('4787653725', 'Nicolás Herrera', 0),
('4859465485', 'María Gómez', 0),
('5103207900', 'Laura Ramírez', 0),
('5122179305', 'Ana León', 0),
('5345175431', 'Mateo Pérez', 0),
('5526157521', 'Daniel Rojas', 0),
('5604738371', 'Juan Díaz', 0),
('5713324141', 'Carlos Navarro', 0),
('5803432566', 'Gabriela Torres', 0),
('6011421995', 'Sofía Rojas', 0),
('6105157807', 'María Ortega', 0),
('6218193639', 'Ana Ramírez', 0),
('6257692178', 'Ana Navarro', 0),
('6459631200', 'Isabella Ortega', 0),
('6473533062', 'Ana Ortega', 0),
('6559845213', 'Sergio Ruiz', 0),
('6773714765', 'Julián Pardo', 0),
('6942744508', 'María Suárez', 0),
('6989677841', 'Nicolás Méndez', 0),
('7106159339', 'Julián Cortés', 0),
('7260595311', 'Juan López', 0),
('7264896482', 'Felipe Méndez', 0),
('7307952399', 'Luis Pérez', 0),
('7722975', 'luz elena', 0),
('7872576226', 'Diana León', 0),
('8065864451', 'Ana León', 0),
('8382290522', 'María Herrera', 0),
('8768222997', 'Mateo Silva', 0),
('8966271177', 'Carlos Rojas', 0),
('9070488687', 'Camila Pardo', 0),
('9401552242', 'Julián León', 0),
('9455558327', 'Paula Díaz', 0),
('9560448514', 'Diana Molina', 0),
('9587023218', 'Laura Castro', 0),
('9880846442', 'Diana Torres', 0),
('9938542551', 'Julián Suárez', 0),
('9948517215', 'Julián Pérez', 0);

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
(63, 0, '3284055678', 1, 1, '2026-03-02 18:57:51'),
(64, 9, '3284055678', 0, 1, '2026-03-02 18:57:51'),
(65, 0, '123456789', 1, 1, '2026-03-02 20:08:06'),
(66, 0, '123456789', 1, 1, '2026-03-02 20:08:06');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`id_administrador`);

--
-- Indices de la tabla `candidatos`
--
ALTER TABLE `candidatos`
  ADD PRIMARY KEY (`id_candidato`);

--
-- Indices de la tabla `registro_mesa`
--
ALTER TABLE `registro_mesa`
  ADD PRIMARY KEY (`id_registro_mesa`);

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
-- AUTO_INCREMENT de la tabla `administrador`
--
ALTER TABLE `administrador`
  MODIFY `id_administrador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `candidatos`
--
ALTER TABLE `candidatos`
  MODIFY `id_candidato` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `registro_mesa`
--
ALTER TABLE `registro_mesa`
  MODIFY `id_registro_mesa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `votos`
--
ALTER TABLE `votos`
  MODIFY `id_voto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
