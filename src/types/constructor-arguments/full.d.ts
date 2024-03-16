import type {
    BaseConstructorArguments,
    LoggerConstructorArguments,
    OptionsConstructorArguments,
} from ".";

type Addition =
    | LoggerConstructorArguments
    | OptionsConstructorArguments;

export type ConstructorArguments = BaseConstructorArguments & Addition;
