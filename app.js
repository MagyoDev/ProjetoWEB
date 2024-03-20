const express = require ("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const post = require("./models/post")
const Agendamentos = require("./models/post")

// Configuração do Handlebars
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true 
    }
}));
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Rota para acessar o formulário de cadastro
app.get("/", function(req, res){
    res.render("index")
})
// Rota para cadastrar no banco de dados
app.post("/cadastrar", function(req, res){
    post.create({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        res.send("Dados enviados com sucesso!")
    }).catch(function(erro){
        res.send("Falha ao cadastrar os dados: " + erro)
    })
})
// Rota para consultar os agendamentos
app.get("/consultar", async (req, res) => {
  try {
      const agendamentos = await Agendamentos.findAll({
          attributes: ['id', 'nome', 'telefone', 'origem', 'data_contato', 'observacao']
      });
      res.render('consultar', { agendamentos });
  } catch (error) {
      res.status(500).send("Erro ao consultar os agendamentos: " + error.message);
  }
});
// Rota para carregar a página de atualização
app.get("/atualizar/:id", async (req, res) => {
  try {
      const id = req.params.id;
      const agendamento = await Agendamentos.findByPk(id);
      if (!agendamento) {
          throw new Error('Agendamento não encontrado.');
      }
      const condicaoCelular = agendamento.origem === 'Celular';
      const condicaoWhatsapp = agendamento.origem === 'Whatsapp';
      const condicaoFixo = agendamento.origem === 'Telefone_fixo';
      res.render("atualizar", { agendamento, condicaoCelular, condicaoWhatsapp, condicaoFixo });
  } catch (error) {
      res.status(500).send("Erro ao carregar a página de atualização: " + error.message);
  }
});
// Rota para atualizar o agendamento
app.post("/atualizar/:id", async (req, res) => {
  try {
      const id = req.params.id;
      const { nome, telefone, origem, data_contato, observacao } = req.body;
      await Agendamentos.update(
          {
              nome: nome,
              telefone: telefone,
              origem: origem,
              data_contato: data_contato,
              observacao: observacao
          },
          {
              where: { id: id }
          }
      );
      res.send("Agendamento atualizado com sucesso!");
  } catch (error) {
      res.status(500).send("Falha ao atualizar o agendamento: " + error.message);
  }
});
// Rota para redirecionar para a página de atualização
app.post("/consultar/atualizar", async (req, res) => {
  try {
      const id = req.body.id;
      res.redirect(`/atualizar/${id}`);
  } catch (error) {
      res.status(500).send("Erro ao redirecionar para a página de atualização: " + error.message);
  }
});
// Rota para excluir um agendamento
app.post("/consultar/excluir/:id", async (req, res) => {
  try {
      const id = req.params.id;
      await Agendamentos.destroy({
          where: { id: id }
      });
      res.send("Agendamento excluído com sucesso!");
  } catch (error) {
      res.status(500).send("Falha ao excluir o agendamento: " + error.message);
  }
});
//Ativando Server
app.listen(8081, function(){
    console.log("Servidor Ativo")
})