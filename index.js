const express = require('express');
const app = express();

const bp = require('body-parser');

const solr = require('solr-client');

app.use(bp.json());

var client = solr.createClient({
  host: '127.0.0.1',
  port: '8983',
  core: 'SOLR-EXPRESS'
});

//SEARCH something from the dbs
app.get('/solr/show', (req,res) => {
  const {rows, searchword, relevanceKey1, relevanceValue1} = req.query;
  // Build a search query var
  const searchQuery = client.createQuery()
    .q( `*${searchword}*`)    //'*AAA*'
    .edismax()
    .qf( {
      first_name: 10, //to be modified in the future, needs hardcoding the relevance key and relevance value from FE
      last_name: 4
    })
    //.mm( 2 )
    .start( 0 )
    .rows( rows );
      client.search(searchQuery, function (err, result) {
        if (err) {
          console.log('Problem is: ', err);
          res.send('With your inputs, we were unable to find something in dbs')
          return;
        }
        const response = result.response;
        if(response.docs.length === 0) {
          res.send('Nothing is found in the dbs with your criterias');
          return;
        }
        if (response && response.docs) {
          response.docs.forEach((doc) => {
          })
        }
        // console.log(response.docs.length); //to see how many things are found in the dbs
        res.send(response);
      });
})

//ADD something to the dbs
app.post('/solr/add', (req,res) => {
  client.autoCommit = true;
  client.add(req.body, function (err, result){
    if(err) {
      console.log('---ERROR---', err);
      return;
    }
    client.commit(function(err,res){
      if(err) console.log(err);
      if(res) console.log(res);
    });
    res.send(result);
  })  
})

//DELETE something, based on id from the dbs
app.delete('/solr/delete', (req,res) => {
  // const stringQuery = 'id:2';    // delete document with id 2
  // const deleteAllQuery = '*';    // delete all
  const objectQuery = req.query;   // Object query basically as first but in object form
  const {id, colName} = objectQuery;
  client.deleteByID(id,function(err,obj){
      if(err){
          console.log(err);
        }else{
          console.log(obj);
        }
      client.commit(function(err,res){
        if(err) console.log(err);
        if(res) console.log(res);
      });
  });
    res.send('item deleted');
})

app.listen(3000, () => {
  console.log('I am serving, master')
})