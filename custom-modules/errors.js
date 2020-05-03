class ProjectNotExistError extends Error {
    constructor(...args) {
        super(...args);
        this.status = 400;
        Error.captureStackTrace(this, ProjectNotExistError);
    }
}

class ParametersError extends Error {
    constructor(...args) {
        super(...args);
        this.status = 400;
        Error.captureStackTrace(this, ParametersError);
    }
}

class TooMuchRetriesError extends Error{
    constructor(...args) {
        super(...args);
        this.status = 400;
        Error.captureStackTrace(this, TooMuchRetriesError);
    }
}

class NothingFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

exports.ProjectNotExistError = ProjectNotExistError;
exports.ParametersError = ParametersError;
exports.TooMuchRetriesError = TooMuchRetriesError;
exports.NothingFoundError = NothingFoundError;