import {
    DEFAULT_THEME,
    Input,
    createTheme,
    mergeMantineTheme,
} from "@mantine/core"

export const theme = mergeMantineTheme(
    DEFAULT_THEME,
    createTheme({
        components: {
            // Input: Input.extend({
            //     styles: {
            //         input: {
            //             background: "var(--mantine-color-blue-9)",
            //             color: "var(--mantine-color-white)",
            //             "::placeholder": {
            //                 color: "var(--mantine-color-white)",
            //             },
            //         },
            //     },
            // }),
        },
    }),
)
