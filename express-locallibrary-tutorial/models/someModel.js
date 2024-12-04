// Определяем схему
var Schema = mongoose.Schema;

var SomeModelSchema = new Schema({
    a_string: String,
    a_date: Date,
  });

  // Компилируем модель из схемы
var SomeModel = mongoose.model("SomeModel", SomeModelSchema);