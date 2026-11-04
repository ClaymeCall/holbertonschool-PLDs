package arena.platform;

import java.util.ArrayList;
import java.util.List;

/**
 * Point d'entrée CLI : java arena.platform.ValidationRunner [missionId|all]
 * Sortie JSON sur stdout pour la plateforme.
 */
public class ValidationRunner {

    public static void main(String[] args) {
        String filter = args.length > 0 ? args[0] : "all";
        List<MissionTest> tests = List.of(
                new Mission0Test(),
                new Mission1Test(),
                new Mission2Test(),
                new Mission3Test(),
                new Mission4Test(),
                new Mission5Test(),
                new Mission6Test()
        );

        List<String> results = new ArrayList<>();
        int passed = 0;
        int failed = 0;

        for (MissionTest test : tests) {
            if (!"all".equals(filter) && !test.missionId().equals(filter)) {
                continue;
            }
            long start = System.currentTimeMillis();
            try {
                test.run();
                long ms = System.currentTimeMillis() - start;
                results.add(obj(
                        kv("id", test.missionId()),
                        kv("title", test.title()),
                        kv("status", "passed"),
                        kv("durationMs", String.valueOf(ms)),
                        kv("message", "OK")
                ));
                passed++;
            } catch (Throwable t) {
                long ms = System.currentTimeMillis() - start;
                String msg = t.getMessage() == null ? t.getClass().getSimpleName() : t.getMessage();
                results.add(obj(
                        kv("id", test.missionId()),
                        kv("title", test.title()),
                        kv("status", "failed"),
                        kv("durationMs", String.valueOf(ms)),
                        kv("message", escape(msg))
                ));
                failed++;
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append('{');
        sb.append("\"passed\":").append(passed).append(',');
        sb.append("\"failed\":").append(failed).append(',');
        sb.append("\"results\":[").append(String.join(",", results)).append(']');
        sb.append('}');
        System.out.println(sb);
    }

    private static String kv(String key, String value) {
        if (value.matches("-?\\d+")) {
            return "\"" + key + "\":" + value;
        }
        return "\"" + key + "\":\"" + value + "\"";
    }

    private static String obj(String... parts) {
        return "{" + String.join(",", parts) + "}";
    }

    private static String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", "");
    }
}
