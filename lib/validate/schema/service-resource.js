'use strict';

const serviceResourceSchema = {
  '$id': '/Resources/Service',
  'type': 'object',
  'description': 'Service',
  'properties': {
    'Type': {
      'type': 'string',
      'const': 'Aliyun::Serverless::Service'
    },
    'Properties': {
      'type': 'object',
      'properties': {
        'Description': {
          'type': 'string'
        },
        'Role': {
          'type': 'string'
        },
        'Policies': {
          oneOf: [
            { 'type': 'string' },
            { '$ref': '/Resources/Service/Role' } ,
            { 
              'type': 'array', 
              'items': { 
                oneOf: [
                  { 'type': 'string' },
                  { '$ref': '/Resources/Service/Role' }
                ]
              }
            },
          ]
        },
        'InternetAccess': {
          'type': 'boolean'
        },
        'VpcConfig': {
          'type': 'object',
          'properties': {
            'VpcId': {'type': 'string'},
            'VSwitchIds': {'type': 'array', 'items': {'type': 'string'}},
            'SecurityGroupId': {'type': 'string'}
          },
          'required': ['VpcId', 'VSwitchIds', 'SecurityGroupId']
        },
        'LogConfig': {
          'type': 'object',
          'properties': {
            'Project': {'type': 'string'},
            'Logstore': {'type': 'string'}
          },
          'required': ['Project', 'Logstore']
        }
      }
    }
  },
  'patternProperties': {
    '^(?!Type|Properties)[a-zA-Z_][a-zA-Z0-9_-]{0,127}$': {
      '$ref': '/Resources/Service/Function'
    }
  },
  'required': ['Type']
};

module.exports = serviceResourceSchema;