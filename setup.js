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
		console.log("\x1b[31m\nSetup ended befor finish \n\x1b[89m\x1b[0m");
		return;
	}

	const appName = response.appName.replace(/ /g, "_");
	generateDockerCompose(appName);
	adaptNginxConfiguration(appName);

	if (response.symfonyProject < 2) {
		const repository = response.customGitRepo || defaultGitRepository;
		cloneGitRepository(repository);
	} else {
		console.log("\x1b[33m\nNo symfony project generated, you have to do it in ./app directory.\x1b[89m\x1b[0m");
	}

	console.log("\x1b[32m\nDocker Symfony project " + response.appName + " generated.\n\x1b[89m\x1b[0m");
};

const generateDockerCompose = (appName) => {
	console.log("\nAdapting docker-compose.yml...");
	const filePath = "./docker-compose.yml";
	replaceInFile(filePath, /\$APP_NAME/g, appName);
};

const adaptNginxConfiguration = (appName) => {
	console.log("Adapting Nginx configuration...");
	const filePath = "./nginx/conf.d/default.conf";
	replaceInFile(filePath, /\$APP_NAME/g, appName);
};

const replaceInFile = (filePath, searchValue, replaceValue) => {
	try {
		const data = fs.readFileSync(filePath, "utf8");
		const result = data.replace(searchValue, replaceValue);
		fs.writeFileSync(filePath, result, "utf8");
		console.log("\x1b[32mDone\x1b[89m\x1b[0m");
	} catch (err) {
		console.error(err);
	}
};

const cloneGitRepository = (repository) => {
	try {
		console.log("Cloning from " + repository + " ...");
		execSync("git clone " + repository + " tmp_app");
		console.log("\x1b[32mDone\x1b[89m\x1b[0m");

		console.log("Prepare Symfony project ...");
		execSync("mv app/DockerFile tmp_app");
		execSync("rm -rf app");
		execSync("mv tmp_app app");
		execSync("rm -rf app/.git");
		console.log("\x1b[32mDone\x1b[89m\x1b[0m");
	} catch (error) {
		console.error(error);
	}
};

console.clear();
init();
// rl.on("close", function () {
// 	const text = "\nProject configured." + "\nDo you want to remove Setup script will be removed.";
// 	rl.question("Where do you live ? ", function (country) {
// 		console.log(" ");

// 		process.exit(0);
// 	});
// });
