//installing essential packages
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

//loading the proto Buffers from corresponding path
const packageDefinition = protoLoader.loadSync('./todo.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

//created package definition
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
//from that package definition we get "TodoService"
var todoService = protoDescriptor.TodoService;

//creating Todo Server
const server = new grpc.Server();

const todos = [
    {
        id: '1', title: 'Todo1', content: 'Content of todo 1'
    },
    {
        id: '2', title: 'Todo2', content: 'Content of todo 2'
    }
];

//adding todoService inside the server
server.addService(todoService.service, {

    //writing our implementation inside key-value pairs
    listTodos: (call, callback) => {
        callback(null, {
            todos: todos
        });
    },
    createTodo: (call, callback) => {
        let incomingNewTodo = call.request;
        todos.push(incomingNewTodo);
        console.log(todos);
        callback(null, incomingNewTodo);
    },
    getTodo: (call, callback) => {
        let incomingTodoRequest = call.request;
        let todoId = incomingTodoRequest.id;
        const response = todos.filter((todo) => todo.id == todoId);
        if (response.length > 0) {
            callback(null, response);
        } else {
            callback({
                message: 'Todo not found'
            }, null);
        }
    }
});


//binded the server to a specific port asynchronously
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log("Started the server");
    server.start();
});