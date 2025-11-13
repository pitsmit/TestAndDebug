class Service {
    static successResponse(data, code = 200) {
        // Формат, который ожидает Controller
        return {
            code: code,
            payload: data
        };
    }

    static rejectResponse(message, code = 500) {
        // Формат, который ожидает Controller
        return {
            code: code,
            error: message
        };
    }
}

module.exports = Service;