const Tournament = require('../models/tournament.model.js');
var spawn = require('child_process').spawn;
var moment = require('moment')
const { exec } = require('child_process');
// Find a single tournament with an SKU
exports.findOne = (req, res) => {
    Tournament.findOne({sku: req.params.tournamentId})
    .then(tournament => {
        if(!tournament) {
            exec('java -jar app/controllers/smart-scan.jar ' + req.params.tournamentId, (error, stdout, stderr) => {
                  if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                  }
                  // Create a Tournament
                  const tournament = new Tournament({
                      sku: req.params.tournamentId,
                      content: stdout
                  });

                  // Save Tournament in the database
                  tournament.save()
                  .then(data => {
                      console.log(data);
                  }).catch(err => {
                      console.log("Error while accessing newly saved data")
                  });
            });
            return res.status(404).send({
                message: "Tournament not found with id " + req.params.tournamentId
            });
        }
        res.send(tournament);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Tournament not found with id " + req.params.tournamentId
            });
        }
        return res.status(500).send({
            message: "Error retrieving tournament with id " + req.params.tournamentId
        });
    });
};
