insert into menu_options (meal_time, option_number, title, ingredients) values
('desayuno', 1, 'Fruta y gelatina', '[{"name":"papaya/melón/manzana","quantity":"1 taza o 1 pieza"},{"name":"gelatina light","quantity":"1 taza"}]'),
('desayuno', 2, 'Licuado de avena', '[{"name":"avena","quantity":"2 cucharadas"},{"name":"papaya/manzana/fresas","quantity":"½ taza"},{"name":"almendras","quantity":"5 piezas"},{"name":"leche de almendras","quantity":"300ml"}]'),
('almuerzo', 1, 'Huevo con frijoles y verduras', '[{"name":"huevo","quantity":"1 pieza"},{"name":"claras de huevo","quantity":"½ taza"},{"name":"frijoles de olla","quantity":"½ taza"},{"name":"aguacate","quantity":"1/3 pieza"},{"name":"nopales","quantity":"1 taza"},{"name":"espinacas","quantity":"al gusto"}]'),
('almuerzo', 2, 'Sándwich de jamón con panela', '[{"name":"pan cero cero","quantity":"2 rebanadas"},{"name":"panela","quantity":"80g"},{"name":"jamón pechuga de pavo","quantity":"2 rebanadas"},{"name":"aguacate","quantity":"1/3 pieza"},{"name":"lechuga, jitomate, pepino","quantity":"al gusto"}]'),
('comida', 1, 'Carne con arroz y verduras', '[{"name":"pollo o bistec","quantity":"150g"},{"name":"arroz","quantity":"1 taza"},{"name":"lechuga, jitomate, pepino","quantity":"al gusto"}]'),
('comida', 2, 'Picadillo fitness', '[{"name":"carne molida de res","quantity":"150g"},{"name":"papa cocida","quantity":"1 taza"},{"name":"salmas","quantity":"1 paquete"},{"name":"calabaza y zanahoria","quantity":"1 taza"}]'),
('colacion', 1, 'Fruta con yogur', '[{"name":"manzana/piña/melón","quantity":"1 pieza o 1 taza"},{"name":"yogur griego","quantity":"150g"},{"name":"almendras o arándanos","quantity":"10 piezas"},{"name":"té verde","quantity":"1 taza"}]'),
('colacion', 2, 'Pre/Post entreno', '[{"name":"café","quantity":"1 taza"},{"name":"manzana o plátano","quantity":"1 pieza o ½"},{"name":"proteína iso hd","quantity":"1 scoop"},{"name":"creatina","quantity":"1 scoop"},{"name":"galleta de arroz","quantity":"1 pieza"},{"name":"crema de cacahuate","quantity":"1 cucharada"}]'),
('cena', 1, 'Panes tostados con queso cottage y huevo', '[{"name":"panes tostados","quantity":"2 piezas"},{"name":"queso cottage","quantity":"80g"},{"name":"aguacate","quantity":"1/3 pieza"},{"name":"huevos cocidos","quantity":"2 piezas"},{"name":"espinacas, jitomate","quantity":"al gusto"},{"name":"gelatina light","quantity":"1 taza"}]'),
('cena', 2, 'Carne con arroz y verduras (cena)', '[{"name":"pollo o bistec","quantity":"120g"},{"name":"arroz","quantity":"½ taza"},{"name":"aguacate","quantity":"1/3 pieza"},{"name":"pepino y jitomate","quantity":"1 taza"},{"name":"gelatina light","quantity":"1 taza"}]');

insert into measurements (fecha, peso, imc, grasa_pct_bascula, grasa_kg, musculo_pct, c_cintura, c_abdominal, grasa_4pliegues_pct, grasa_4pliegues_kg) values
('2026-04-03', 110.55, 33.37, 27.9, 30.8, 36.5, 110.3, 117.9, 29.83, 32.98),
('2026-04-30', 107.9, 32.57, 27.3, 29.5, 36.7, 105.1, 111.2, 28.57, 30.83);
