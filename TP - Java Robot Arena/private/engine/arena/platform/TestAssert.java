package arena.platform;

final class TestAssert {

    private TestAssert() {
    }

    static void assertTrue(String message, boolean condition) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }

    static void assertEquals(String message, Object expected, Object actual) {
        if (expected == null ? actual != null : !expected.equals(actual)) {
            throw new AssertionError(message + " | attendu=" + expected + " obtenu=" + actual);
        }
    }

    static void assertEquals(String message, int expected, int actual) {
        if (expected != actual) {
            throw new AssertionError(message + " | attendu=" + expected + " obtenu=" + actual);
        }
    }

    static void assertNotEquals(String message, int unexpected, int actual) {
        if (unexpected == actual) {
            throw new AssertionError(message + " | valeur interdite=" + unexpected);
        }
    }

    static void fail(String message) {
        throw new AssertionError(message);
    }
}
