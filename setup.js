const prompts = require("prompts");
const fs = require("fs");
const { execSync } = require("child_process");

const defaultGitRepository = "git@github.com:Deveosys/symfony-react-bootstrap.git";

const steps = [
	{
		type: "text",
		name: "appName",
		message: "App name",
		validate: (value) => (value == "" ? `App name is required` : true),
	},
	{
		type: "select",
		name: "symfonyProject",
		message: "Symfony project generation",
		choices: [
			{ title: "Generic", description: "Pull the generic Deveosys symfony 4 boilerplate" },
			{ title: "Yours from a repo", description: "You'll be prompted for a git repository" },
			{ title: "Custom", description: "Nothing will be placed in app/ folder." },
		],
		initial: 0,
	},
	{
		type: (prev) => (prev == 1 ? "text" : null),
		name: "customGitRepo",
		message: "Your git repository",
	},
];

const init = async () => {
	console.log("\nDocker Symfony configuration");
	console.log("-----------------------------\n");

	const response = await prompts(steps);
	if (!response.appName || response.symfonyProject == undefined) {
		logStateMessage("\x1b[31m\nSetup ended befor finish \n\x1b[89m\x1b[0m");
		return;
	}

	const appName = response.appName.toLowerCase().replace(/ /g, "_");
	generateDockerCompose(appName);
	adaptNginxConfiguration(appName);

	if (response.symfonyProject < 2) {
		const repository = response.customGitRepo || defaultGitRepository;
		cloneGitRepository(repository);
	} else {
		logStateMessage("\x1b[33m\nNo symfony project generated, you have to do it in ./app directory.\x1b[89m\x1b[0m");
	}

	removeCurrentGit();

	console.log(
		"\x1b[32m\nDocker Symfony project " + response.appName + " generated and ready to use.\n\x1b[89m\x1b[0m"
	);
	secondPart();
};

const steps2 = [
	{
		type: "confirm",
		name: "gitInit",
		message: "Do you want to generate a new git repository ? (git init)",
		initial: true,
	},
];

const secondPart = async () => {
	const response = await prompts(steps2);
	if (response.gitInit == undefined) {
		logStateMessage("\x1b[31m\nSetup ended befor finish \n\x1b[89m\x1b[0m");
		return;
	}

	if (response.gitInit) gitInit();

	console.log("\n\n-----------------      Prod      -----------------\n");
	console.log("    $ docker-compose up --build -d");

	console.log("\n-----------------      Dev      -----------------\n");
	console.log("    $ cd app && composer install && yarn");
	console.log("    $ symfony server:start");
	console.log("    $ yarn watch");

	console.log("\x1b[32m\n" + "*****************    ENJOY !    *****************" + "\n\x1b[89m\x1b[0m");
};

const generateDockerCompose = (appName) => {
	logStateMessage("\nAdapting docker-compose.yml...");
	const filePath = "./docker-compose.yml";
	replaceInFile(filePath, /\$APP_NAME/g, appName);
};

const adaptNginxConfiguration = (appName) => {
	logStateMessage("Adapting Nginx configuration...");
	const filePath = "./nginx/conf.d/default.conf";
	replaceInFile(filePath, /\$APP_NAME/g, appName);
};

const replaceInFile = (filePath, searchValue, replaceValue) => {
	try {
		const data = fs.readFileSync(filePath, "utf8");
		const result = data.replace(searchValue, replaceValue);
		fs.writeFileSync(filePath, result, "utf8");
		logDone();
	} catch (err) {
		console.error(err);
	}
};

const cloneGitRepository = (repository) => {
	try {
		logStateMessage("Cloning from " + repository + " ...");
		execSync("git clone " + repository + " tmp_app");
		logDone();

		logStateMessage("Prepare Symfony project...");
		execSync("mv app/Dockerfile tmp_app");
		execSync("rm -rf app");
		execSync("mv tmp_app app");
		execSync("rm -rf app/.git");
		logDone();
	} catch (error) {
		console.error(error);
	}
};

const removeCurrentGit = () => {
	logStateMessage("Removing current Git project...");
	execSync("rm -rf .git");
	logDone();
};

const gitInit = () => {
	logStateMessage("Generating new Git project...");
	execSync("git init");
	logDone();
};

console.clear();
init();

const logStateMessage = (message) => {
	process.stdout.write(message);
};

const logDone = () => {
	process.stdout.write(" \x1b[32mDone\x1b[89m\x1b[0m\n");
};
