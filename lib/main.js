//jshint esversion:6
const mariadb = require('mariadb');
const dotenv = require('dotenv').config();
const sql = require('./sql');

// creating mariadb connection pool
const pool = mariadb.createPool({
  host: "127.0.0.1",
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
  multipleStatements: true
})

const handler = {
  "runQueries": async function(code) {
    // takes in SQL queries and runs them on the database in the connection pool above
    const conn = await pool.getConnection();
    const results = await Promise.all(code.map((item) => {
      return conn.query(item);
    }));
    conn.release();
    return results;
  },
  "queryBuilder": async function(data, type, id) {
    // Builds a type of query based on the desired type. Used for building inserts, deletes, and updates
    let query = "";
    data[type].forEach(item => {
      const s1 = item["id"] != 0 ? 1 : 0;
      const s2 = item[type] != '' ? 1 : 0;
      switch (s1 + "|" + s2) {
        case "1|1":
          // update
          if (type !== "sprint"){
            query = query.concat(sql.updateProjDetails(id, item["id"], type, item[type], ''));
          } else {
            const check = item["checked"] ? 1 : 0;
            const where = ', sprint_num = ' + item["sprint_num"] + ', is_checked = ' + check;
            query = query.concat(sql.updateProjDetails(id, item["id"], type, item[type], where));
          }
          break;
        case "1|0":
          // delete
          query = query.concat(sql.deleteProjDetails(item["id"], type));
          break;
        case "0|1":
          // insert
          if (type !== "sprint"){
            query = query.concat(sql.insertProjDetails(id, type, item[type], ''));
          } else {
            const check = item["checked"] ? 1 : 0;
            const where = ', sprint_num = ' + item["sprint_num"] + ', is_checked = ' + check;
            query = query.concat(sql.insertProjDetails(id, type, item[type], where));
          }
          break;
      }
    });
    console.log(query);
    if (query != "") {
      return await this.runQueries([query]);
    }
  },
  "getDateTime": () => {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + ' ' + time;
    return dateTime;
  },
  "deetFunction": (deet, type, ifCall) => {
    // Takes the details of a project and maps it to convert it into an object that can be split into features, languages, and sprints. Used primarily to pull data out for projects
    const x = [];
    Object.keys(deet).forEach((item) => {
      if (item !== "meta"){
        if (deet[item][type] != null) {
          let objCreator = {};
          objCreator.id = deet[item].id;
          objCreator[type] = deet[item][type];
          if (ifCall) {
            objCreator.sprint_num = deet[item].sprint_num;
            objCreator.is_checked = deet[item].is_checked;
          }
          if (objCreator !== {}) {
            x.push(objCreator);
          }
         }
       }
      }
    );
    return x;
    // return x.slice(0, -1);
  }
};

module.exports = handler ;
