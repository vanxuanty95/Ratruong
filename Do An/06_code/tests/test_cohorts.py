import pathlib
import sys
import unittest


CODE_ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(CODE_ROOT / "src"))

from grapes_rec.cohorts import item_popularity_cohort, user_activity_cohort


class FrozenCohortTests(unittest.TestCase):
    def test_item_boundaries_are_exhaustive_and_tie_safe(self):
        self.assertEqual(item_popularity_cohort(1), "tail")
        self.assertEqual(item_popularity_cohort(12), "tail")
        self.assertEqual(item_popularity_cohort(13), "body")
        self.assertEqual(item_popularity_cohort(396), "body")
        self.assertEqual(item_popularity_cohort(397), "head")

    def test_user_boundaries_match_registered_activity_groups(self):
        self.assertEqual(user_activity_cohort(1), "singleton")
        self.assertEqual(user_activity_cohort(2), "repeat_light")
        self.assertEqual(user_activity_cohort(3), "repeat_light")
        self.assertEqual(user_activity_cohort(4), "active")

    def test_zero_degree_is_outside_the_mapped_warm_start_population(self):
        with self.assertRaises(ValueError):
            item_popularity_cohort(0)
        with self.assertRaises(ValueError):
            user_activity_cohort(0)


if __name__ == "__main__":
    unittest.main()
