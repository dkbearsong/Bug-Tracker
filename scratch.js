let conn;
const projectFeat = JSON.parse(req.body.features);
const projectLang = JSON.parse(req.body.languages);
const projectSprints = JSON.parse(req.body.sprints);
const updateQuery = sql.updateProject(req.body.project_name, req.body.project_description, req.body.category, req.body.proj_id);
let updateFeatures = "";
let updateLanguages = "";
let updateSprints = "";
const projUpdate = (action, table, id, item, where) => action + ' proj_' + table + 's SET project_id = ' + id + ', ' + table + ' = \'' + escapeRegExp(item).replace(/"/g, '\\\"').replace(/'/g, "\\\'") + '\' ' + where + '; ';
try {
  conn = await pool.getConnection();
  const results = await conn.query(updateQuery);
  const id = await conn.query(sql.getCreatedProject);
  Object.keys(projectFeat).forEach(item => {
    if (projectFeat[item]["id"] != 0 && projectFeat[item]["feature"] != '') {
      updateFeatures = updateFeatures.concat(projUpdate('UPDATE', 'feature', req.body.proj_id, projectFeat[item]["feature"], "WHERE id = " + projectFeat[item]["id"]));
    } else if (projectFeat[item]["id"] != 0 && projectFeat[item]["feature"] === '' ) {
      updateFeatures = updateFeatures.concat('DELETE FROM proj_features WHERE id = ' + projectFeat[item]["id"] + '; ');
    } else if (projectFeat[item]["id"] === 0 && projectFeat[item]["feature"] != '') {
      updateFeatures = updateFeatures.concat(projUpdate('INSERT INTO', 'feature', req.body.proj_id, projectFeat[item]["feature"], ''));
    }
  });
  Object.keys(projectLang).forEach(item => {
    if (projectLang[item]["id"] != 0 && projectLang[item]["language"] != '') {
      updateLanguages = updateLanguages.concat(projUpdate('UPDATE', 'language', req.body.proj_id, projectLang[item]["language"], "WHERE id = " + projectLang[item]["id"]));
    } else if (projectLang[item]["id"] != 0 && projectLang[item]["language"] === '' ) {
      updateLanguages = updateLanguages.concat('DELETE FROM proj_languages WHERE id = ' + projectLang[item]["id"] + '; ');
    } else if (projectLang[item]["id"] === 0 && projectLang[item]["language"] != '') {
      updateLanguages = updateLanguages.concat(projUpdate('INSERT INTO', 'language', req.body.proj_id, projectLang[item]["language"], ''));
    }
  });
  Object.keys(projectSprints).forEach(item => {
    if (projectSprints[item]["id"] != 0 && projectSprints[item]["sprint"] != '') {
      updateSprints = updateSprints.concat(projUpdate('UPDATE', 'sprint', req.body.proj_id, projectSprints[item]["sprint"], ', sprint_num =' + projectSprints[item]["sprint_num"] + ', is_checked = ' + projectSprints[item]["checked"] + ' WHERE id = ' + projectSprints[item]["id"]));
    } else if (projectSprints[item]["id"] != 0 && projectSprints[item]["sprint"] === '' ) {
      updateSprints = updateSprints.concat('DELETE FROM proj_sprints WHERE id = ' + projectSprints[item]["id"] + '; ');
    } else if (projectSprints[item]["id"] === 0 && projectSprints[item]["sprint"] != '') {
      updateSprints = updateSprints.concat(projUpdate('INSERT INTO', 'sprint', req.body.proj_id, projectSprints[item]["sprint"], ', sprint_num =' + projectSprints[item]["sprint_num"] + ', is_checked = ' + projectSprints[item]["checked"]));
    }
  });
  if (updateFeatures != "") {
    const feat = await conn.query(updateFeatures);
  }
  if (updateLanguages != "") {
    const lang = await conn.query(updateLanguages);
  }
  if (updateSprints != "") {
    const sprints = await conn.query(updateSprints);
  }
  res.redirect('/projects/' + req.body.proj_id);
} catch (err) {
  throw err;
} finally {
  if (conn) return conn.release();
}
