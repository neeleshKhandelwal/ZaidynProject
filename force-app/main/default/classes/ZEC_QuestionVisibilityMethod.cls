public class ZEC_QuestionVisibilityMethod {

    public static boolean areEqual(List<String> arr1, List<String> arr2)
    {
        integer N = arr1.Size();
        integer M = arr2.Size();
 
        // If lengths of arrays are not equal
        if (N != M)
            return false;
 
        // Store arr1[] elements and their counts in
        // hash map
        Map<String, Integer> mapVal
            = new Map<String, Integer>();
        integer count = 0;
        for (integer i = 0; i < N; i++) {
            if (mapVal.get(arr1[i]) == null)
                mapVal.put(arr1[i], 1);
            else {
                count = mapVal.get(arr1[i]);
                count++;
                mapVal.put(arr1[i], count);
            }
        }
 
        // Traverse arr2[] elements and check if all
        // elements of arr2[] are present same number
        // of times or not.
        for (integer i = 0; i < N; i++) {
 
            // If there is an element in arr2[], but
            // not in arr1[]
            if (!mapVal.containsKey(arr2[i]))
                return false;
 
            // If an element of arr2[] appears more
            // times than it appears in arr1[]
            if (mapVal.get(arr2[i]) == 0)
                return false;
 
            count = mapVal.get(arr2[i]);
            --count;
            mapVal.put(arr2[i], count);
        }
 
        return true;
    }
 
    // Driver's code
    /*public static void main(String[] args)
    {
        int arr1[] = { 3, 5, 2, 5, 2 };
        int arr2[] = { 2, 3, 5, 5, 2 };
 
        // Function call
        if (areEqual(arr1, arr2))
            System.out.println("Yes");
        else
            System.out.println("No");
    }*/
}