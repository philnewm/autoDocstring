/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    Argument,
    Decorator,
    DocstringParts,
    Exception,
    KeywordArgument,
    Returns,
    Yields,
} from "../docstring_parts";

export class TemplateData {
    public name: string;
    public summary: string;
    public description: string;
    public todo: string;
    public warnings: string;
    public notes: string;
    public decorators: Decorator[];
    public args: Argument[];
    public kwargs: KeywordArgument[];
    public exceptions: Exception[];
    public returns: Returns;
    public yields: Yields;

    private includeName: boolean;
    private includeExtendedSummary: boolean;


    constructor(
        docstringParts: DocstringParts,
        guessTypes: boolean,
        includeName: boolean,
        includeExtendedSummary: boolean,
    ) {
        this.name = docstringParts.name;
        this.decorators = docstringParts.decorators;
        this.args = docstringParts.args;
        this.kwargs = docstringParts.kwargs;
        this.exceptions = docstringParts.exceptions;
        this.returns = docstringParts.returns;
        this.yields = docstringParts.yields;

        this.includeName = includeName;
        this.includeExtendedSummary = includeExtendedSummary;

        if (!guessTypes) {
            this.removeTypes();
        }

        this.addDefaultTypePlaceholders("_type_");
        this.summary = "${@@@:Describe " + this.name + " in a short onliner.}"
        this.description = "${@@@:Detailed description of " + this.name +"}"
        this.todo = "${@@@:list needed todos here}"
        this.warnings = "${@@@:If function raises warnings add them here with simple description.}"
        this.notes = "${@@@:Additional Notes can be usefull.}"
    }

    public placeholder() {
        return (text: string, render: (_: string) => string): string => {
            return "${@@@:" + render(text) + "}";
        };
    }

    public summaryPlaceholder(): string {
        if (this.includeName) {
            return this.name + this.summary;
        }

        return this.summary;
    }

    public extendedSummaryPlaceholder(): string {
        if (this.includeExtendedSummary) {
            return this.description;
        }

        return "";
    }

    public todoPlaceholder() {
        return "Todos:\n    - " + this.todo;
    }
    public warningsPlaceholder() {
        return "Warnings:\n    " + this.warnings;
    }
    public notesPlaceholder() {
        return "Notes:\n    " + this.notes;
    }

    public typePlaceholder(): string {
        // Need to ignore rules because this.type only works in
        // the context of mustache applying a template
        // @ts-ignore
        return "${@@@:" + this.type + "}";
    }

    public descriptionPlaceholder(): string {
        return "${@@@:_description_}";
    }

    public argsExist(): boolean {
        return this.args.length > 0;
    }

    public kwargsExist(): boolean {
        return this.kwargs.length > 0;
    }

    public parametersExist(): boolean {
        return this.args.length > 0 || this.kwargs.length > 0;
    }

    public exceptionsExist(): boolean {
        return this.exceptions.length > 0;
    }

    public returnsExist(): boolean {
        return this.returns !== undefined;
    }

    public yieldsExist(): boolean {
        return this.yields != undefined;
    }

    private removeTypes(): void {
        for (const arg of this.args) {
            arg.type = undefined;
        }

        for (const kwarg of this.kwargs) {
            kwarg.type = undefined;
        }

        if (this.yieldsExist()) {
            this.yields.type = undefined;
        }

        if (this.returnsExist()) {
            this.returns.type = undefined;
        }
    }

    private addDefaultTypePlaceholders(placeholder: string): void {
        for (const arg of this.args) {
            if (arg.type === undefined) {
                arg.type = placeholder;
            }
        }

        for (const kwarg of this.kwargs) {
            if (kwarg.type === undefined) {
                kwarg.type = placeholder;
            }
        }

        const returns = this.returns;
        if (returns !== undefined && returns.type === undefined) {
            returns.type = placeholder;
        }

        const yields = this.yields;
        if (yields != undefined && yields.type == undefined) {
            yields.type = placeholder;
        }
    }
}
