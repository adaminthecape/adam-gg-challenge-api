export type IReq = {
	[key: string]: any;
};

export type IRes = {
	[key: string]: any;
};

export type Todo = {
	note: string;
	created?: number;
	updated?: number;
};

export type User = {
	username: string;
	password: string;
};
