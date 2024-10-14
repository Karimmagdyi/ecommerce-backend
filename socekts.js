let io;

module.exports={
    init:port=>{
        io=require('socket.io')(port,
            {
                cors: {
                    origin: 'http://localhost:3000', // Your React app URL
                    methods: ['GET', 'POST'],
                    credentials: true,
                },
            }
        )
        return io
    },
    getIo:()=>{
        if (!io){
            throw new Error('io are not init yet')
        }
        return io
    }
}