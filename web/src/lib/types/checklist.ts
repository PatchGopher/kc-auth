export type Checklist = {
    id: number;
    name: string;
    todos: Todo[];
};

export type Todo = {
    id: number;
    text: string;
    completed: boolean;
};