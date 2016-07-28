var program = require('commander');

program
    .version('0.0.50');

program.command('register')
    .description('Register this hub with Bitdog Cloud.')
    .option('-u,--username <username>', 'The username for the Bitdog IoT Cloud to register this node with.')
    .option('-p,--passphrase <passphrase>', 'The passphrase for the Bitdog IoT Cloud to register this node with.')
    .option('-n,--nodename <nodename>', 'The name that will be displayed on the Bitdog IoT Cloud dashboard.')
    .action(function (options) {

        if (typeof options.passphrase == 'undefined' || typeof options.username == 'undefined') {
            console.log('Please provide a username and passphrase when registering.');
            this.outputHelp();
        }
        else {
            console.log('Registering node...')
            var adminManager = require('../lib/admin/managers/adminManager.js');
            var nodeName = typeof options.nodename == 'undefined' ? 'New Node' : options.nodename;
            adminManager.registerNode(options.username, options.passphrase, nodeName, function (success) { console.log('Registration successful.'); }, function (error) { console.log(error); });

        }


    });

program
    .command('start')
    .description('Start Bitdog Hub.')
    .option('-c,--configuration', 'Configuration directory path')
    .option('-e,--stop', 'Stop Bitdog agent')
    .action(function (options) {

        if ((options.start && options.stop) || (typeof options.start == 'undefined' && typeof options.stop == 'undefined')) {
            console.log('Please provide one option.');
            this.outputHelp();
        } else if (options.start) {

            var agentPid = null;
            var AgentProcess = require('../lib/agentProcess.js');
            var agentProcess = new AgentProcess();
            agentPid = agentProcess.start();

        } else if (options.stop) {
            var AgentProcess = require('../lib/agentProcess.js');
            var agentProcess = new AgentProcess();
            agentProcess.stop();
        }




    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
