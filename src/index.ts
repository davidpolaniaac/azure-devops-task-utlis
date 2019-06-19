import * as vm from 'azure-devops-node-api';
import * as lim from 'azure-devops-node-api/interfaces/LocationsInterfaces';
import tl = require('azure-pipelines-task-lib/task');

function getEnv(name: string): string {
  const val = tl.getVariable(name);
  if (!val) {
    console.error(name + ' env var not set');
    name.includes('SYSTEM_ACCESSTOKEN')
      ? console.log('Remember to enable in the agent "Allow scripts to access the OAuth token"')
      : console.log('It is not found in the agent variables');
    tl.setResult(tl.TaskResult.Failed, 'env var not set');
    process.exit(1);
  }
  return val;
}

function validateEnv(name: string): boolean {
  return !!tl.getVariable(name);
}

export async function getWebApi(): Promise<vm.WebApi> {
  const serverUrl = getEnv('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI');
  return await getApi(serverUrl);
}

export async function getApi(serverUrl: string, optionApi?: any): Promise<vm.WebApi> {
  return new Promise<vm.WebApi>(async (resolve, reject) => {
    try {
      const token = validateEnv('SYSTEM_ACCESSTOKEN_LOCAL')
        ? getEnv('SYSTEM_ACCESSTOKEN_LOCAL')
        : getEnv('SYSTEM_ACCESSTOKEN');
      const authHandler = validateEnv('SYSTEM_ACCESSTOKEN_LOCAL')
        ? vm.getPersonalAccessTokenHandler(token)
        : vm.getBearerHandler(token);
      const option = optionApi;

      const vsts: vm.WebApi = new vm.WebApi(serverUrl, authHandler, option);
      const connData: lim.ConnectionData = await vsts.connect();
      resolve(vsts);
    } catch (err) {
      reject(err);
    }
  });
}

export function getProject(): string {
  return getEnv('SYSTEM_TEAMPROJECTID');
}

export function banner(title: string): void {
  console.log();
  console.log('=======================================');
  console.log('\t' + title);
  console.log('=======================================');
  console.log();
}

export function heading(title: string): void {
  console.log();
  console.log('> ' + title);
}
