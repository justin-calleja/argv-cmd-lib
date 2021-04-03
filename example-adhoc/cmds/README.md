Be careful not to introduce cyclic dependencies when defining your commands. Each command should only ever depend (require) its sub-commands in its definition.

If you need to shared code, put it somewhere outside of a cmd module and require that module from each cmd module that needs it.
