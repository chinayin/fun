'use strict';

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const assert = sinon.assert;

const deploySupport = require('../../lib/deploy/deploy-support');
const ram = require('../../lib/ram');

describe('deploy', () => {
  beforeEach(() => {
    Object.keys(deploySupport).forEach(m => {
      sandbox.stub(deploySupport, m).resolves({});
    });

    Object.keys(ram).forEach(m => {
      if (m === 'makeRole') {
        sandbox.stub(ram, m).resolves({
          'Role': {
            'Arn': 'acs:ram::123:role/aliyunfcgeneratedrole-fc'
          }
        });
      } else {
        sandbox.stub(ram, m).resolves({});
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  async function deploy(example) {
    await proxyquire('../../lib/deploy/deploy-by-tpl', {
      './deploy-support': deploySupport,
      '../ram': ram
    })(`./examples/${example}/template.yml`);

    // await proxyquire('../../lib/deploy/deploy-support', {
      
    // })(`./examples/${example}/template.yml`);
  }

  it('deploy datahub', async () => {
    await deploy('datahub');

    assert.calledWith(deploySupport.makeService, {
      description: undefined,
      internetAccess: null,
      logConfig: {  },
      role: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'MyService',
      vpcConfig: undefined
    });
  
    assert.calledWith(deploySupport.makeFunction, {
      codeUri: 'datahub.js',
      description: undefined,
      functionName: 'MyFunction',
      handler: 'datahub.index',
      memorySize: undefined,
      runtime: 'nodejs6',
      serviceName: 'MyService',
      timeout: undefined,
      environmentVariables: undefined
    });
  });

  it('deploy helloworld', async () => {
    await deploy('helloworld');

    assert.calledWith(deploySupport.makeService, {
      description: 'fc test',
      internetAccess: null,
      logConfig: {  },
      role: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'fc',
      vpcConfig: undefined
    });
    assert.calledWith(deploySupport.makeFunction, {
      codeUri: './',
      description: undefined,
      functionName: 'helloworld',
      handler: 'helloworld.index',
      memorySize: undefined,
      runtime: 'nodejs8',
      serviceName: 'fc',
      timeout: 60,
      environmentVariables: undefined
    });
  });

  it('deploy java', async () => {
    await deploy('java');

    assert.calledWith(deploySupport.makeService, {
      description: 'java demo',
      internetAccess: null,
      logConfig: {  },
      role: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'java',
      vpcConfig: undefined
    });
    assert.calledWith(deploySupport.makeFunction, {
      codeUri: './demo.jar',
      description: 'Hello world!',
      functionName: 'helloworld',
      handler: 'example.App::handleRequest',
      memorySize: undefined,
      runtime: 'java8',
      serviceName: 'java',
      timeout: undefined,
      environmentVariables: undefined
    });

  });

  it('deploy openid_connect', async () => {
    await deploy('openid_connect');

    assert.calledWith(deploySupport.makeService, {
      description: 'fc test',
      internetAccess: null,
      logConfig: {  },
      role: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'fc',
      vpcConfig: undefined
    });

    assert.calledWith(deploySupport.makeFunction, {
      codeUri: './',
      description: 'Hello world!',
      functionName: 'helloworld',
      handler: 'helloworld.index',
      memorySize: undefined,
      runtime: 'nodejs8',
      serviceName: 'fc',
      timeout: undefined,
      environmentVariables: undefined
    });
    assert.calledWith(deploySupport.makeGroup, {
      name: 'aliyunfcdemo2',
      description: 'api group for function compute'
    });
    assert.calledWith(deploySupport.makeApi, {}, {
      apiName: 'connectid',
      auth: {
        config: {
          'idTokenParamName': 'token',
          'openidApiType': 'BUSINESS'
        },
        type: 'APPOPENID'
      },
      description: undefined,
      functionName: 'helloworld',
      method: 'get',
      parameters: [
        {
          location: 'Path',
          apiParameterName: 'token',
          parameterType: 'REQUIRED',
          type: 'String'
        }
      ],
      requestPath: '/getUserInfo/[token]',
      roleArn: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'fc',
      stageName: 'RELEASE',
      visibility: 'PRIVATE',
      serviceTimeout: 3000,
      resultConfig: { failResultSample: undefined, resultSample: undefined, resultType: undefined },      
      requestConfig: {  }
    });
  });

  it('deploy ots_stream', async () => {
    await deploy('ots_stream');

    assert.calledWith(deploySupport.makeService, {
      description: 'Stream trigger for OTS',
      internetAccess: null,
      logConfig: {  },
      role: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'otsstream',
      vpcConfig: undefined
    });
    assert.calledWith(deploySupport.makeFunction, {
      codeUri: './',
      description: undefined,
      functionName: 'processor',
      handler: 'main.index',
      memorySize: undefined,
      runtime: 'nodejs8',
      serviceName: 'otsstream',
      timeout: undefined,
      environmentVariables: undefined
    });
    assert.calledWith(deploySupport.makeOtsTable, {
      instanceName: 'fun-test',
      primaryKeys: [
        {
          name: 'uid',
          type: 'STRING'
        }
      ],
      tableName: 'mytable'
    });
  });

  it('deploy python', async () => {
    await deploy('python');

    assert.calledWith(deploySupport.makeService, {
      description: 'python demo',
      internetAccess: null,
      logConfig: {  },
      role: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'pythondemo',
      vpcConfig: undefined
    });
    assert.calledWith(deploySupport.makeFunction, {
      codeUri: './',
      description: 'Hello world with python!',
      functionName: 'hello',
      handler: 'main.hello',
      memorySize: undefined,
      runtime: 'python2.7',
      serviceName: 'pythondemo',
      timeout: undefined,
      environmentVariables: undefined
    });
    assert.calledWith(deploySupport.makeGroup, {
      description: 'api group for function compute',
      name: 'apigw_fc'
    });
    assert.calledWith(deploySupport.makeApi, {}, {
      apiName: 'pythonhello',
      auth: {
        config: undefined,
        type: undefined
      },
      description: undefined,
      functionName: 'hello',
      method: 'get',
      parameters: undefined,
      requestPath: '/python/hello',
      roleArn: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'pythondemo',
      stageName: 'RELEASE',
      visibility: undefined,
      serviceTimeout: 3000,
      requestConfig: {},
      resultConfig: { failResultSample: undefined, resultSample: undefined, resultType: undefined },    });
  });
  it('deploy segment', async () => {
    await deploy('segment');

    assert.calledWith(deploySupport.makeService, {
      description: 'Module as a service',
      internetAccess: null,
      logConfig: {  },
      role: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'maas',
      vpcConfig: undefined
    });
    
    assert.calledWith(deploySupport.makeFunction, {
      codeUri: './',
      description: 'do segment',
      functionName: 'doSegment',
      handler: 'index.doSegment',
      memorySize: undefined,
      runtime: 'nodejs8',
      serviceName: 'maas',
      timeout: undefined,
      environmentVariables: undefined
    });

    assert.calledWith(deploySupport.makeGroup, {
      description: 'api group for function compute',
      name: 'maasapi'
    });
    assert.calledWith(deploySupport.makeApi, {}, {
      description: undefined,
      apiName: 'segment_post',
      auth: { config: undefined, type: undefined },
      functionName: 'doSegment',
      method: 'post',
      parameters: undefined,
      requestPath: '/do_segment',
      roleArn: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'maas',
      stageName: 'RELEASE',
      visibility: undefined,
      resultConfig: { failResultSample: undefined, resultSample: undefined, resultType: undefined },
      serviceTimeout: 3000,
      requestConfig: { requestMode: 'PASSTHROUGH', requestProtocol: 'http' }
    });
  });
  it('deploy timer', async () => {
    await deploy('timer');

    assert.calledWith(deploySupport.makeService, {
      description: undefined,
      internetAccess: null,
      logConfig: {  },
      role: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'MyService',
      vpcConfig: undefined
    });
    assert.calledWith(deploySupport.makeFunction, {
      codeUri: './',
      description: 'send hangzhou weather',
      functionName: 'MyFunction',
      handler: 'index.handler',
      memorySize: undefined,
      runtime: 'nodejs8',
      serviceName: 'MyService',
      timeout: undefined,
      environmentVariables: undefined
    });
    assert.calledWith(deploySupport.makeTrigger, {
      functionName: 'MyFunction',
      serviceName: 'MyService',
      triggerName: 'TmTrigger',
      triggerProperties: {
        CronExpression: '0 0 8 * * *',
        Enable: true,
        Payload: 'awesome-fc'
      },
      triggerType: 'Timer'
    });
  });
  it('deploy wechat', async () => {
    await deploy('wechat');

    assert.calledWith(deploySupport.makeService, {
      description: 'wechat demo',
      internetAccess: null,
      logConfig: {  },
      role: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'wechat',
      vpcConfig: undefined
    });
    assert.calledWith(deploySupport.makeFunction.firstCall, {
      codeUri: './',
      description: 'Wechat get handler',
      functionName: 'get',
      handler: 'wechat.get',
      memorySize: undefined,
      runtime: 'nodejs6',
      serviceName: 'wechat',
      timeout: undefined,
      environmentVariables: undefined
    });
    assert.alwaysCalledWith(deploySupport.makeGroup, {
      description: 'api group for function compute',
      name: 'wechat_group'
    });
    assert.calledWith(deploySupport.makeApi.firstCall, {}, {
      apiName: 'wechat_get',
      auth: { config: undefined, type: undefined },
      functionName: 'get',
      method: 'get',
      description: undefined,
      parameters: [
        { apiParameterName: 'encrypt_type' },
        { apiParameterName: 'msg_signature' },
        { location: 'Query', apiParameterName: 'timestamp', required: 'REQUIRED', parameterType: 'String' },
        { location: 'Query', apiParameterName: 'nonce', parameterType: 'String' },
        { location: 'Query', apiParameterName: 'signature', parameterType: 'String' },
        { location: 'Query', apiParameterName: 'echostr', parameterType: 'String' }
      ],
      requestPath: '/wechat',
      roleArn: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'wechat',
      stageName: 'RELEASE',
      visibility: undefined,
      requestConfig: { bodyFormat: 'STREAM', requestMode: 'MAPPING', requestProtocol: 'HTTP' },
      resultConfig: { failResultSample: undefined, resultSample: undefined, resultType: undefined },      
      serviceTimeout: 3000
    });

    assert.calledWith(deploySupport.makeFunction.secondCall, {
      codeUri: './',
      description: 'Wechat post handler',
      functionName: 'post',
      handler: 'wechat.post',
      memorySize: undefined,
      runtime: 'nodejs6',
      serviceName: 'wechat',
      timeout: undefined,
      environmentVariables: undefined
    });
    assert.calledWith(deploySupport.makeApi.secondCall, {}, {
      apiName: 'wechat_post',
      auth: { config: undefined, type: undefined },
      functionName: 'post',
      method: 'post',
      description: undefined,
      parameters: [
        { location: 'Query', apiParameterName: 'timestamp', required: 'REQUIRED', parameterType: 'String' }, 
        { location: 'Query', apiParameterName: 'nonce', parameterType: 'String' }, 
        { location: 'Query', apiParameterName: 'signature', parameterType: 'String' }, 
        { location: 'Query', apiParameterName: 'msg_signature', parameterType: 'String' }, 
        { location: 'Query', apiParameterName: 'encrypt_type', parameterType: 'String' }
      ],
      requestPath: '/wechat',
      roleArn: `acs:ram::123:role/aliyunfcgeneratedrole-fc`,
      serviceName: 'wechat',
      stageName: 'RELEASE',
      visibility: undefined,
      requestConfig: { bodyFormat: 'STREAM', requestMode: 'MAPPING', requestProtocol: 'HTTP' },
      resultConfig: { failResultSample: undefined, resultSample: undefined, resultType: undefined },      serviceTimeout: 3000
    });
  });
});