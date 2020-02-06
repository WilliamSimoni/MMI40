package IOoperations;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class JsonIO {
	
	//REQUIRE: fileName != null
	//RETURNS: if fileName exists, returns the JSONObject which represent the the file content. If something go wrong, returns null
	
	public static JSONObject read (String fileName) {
		JSONParser parser = new JSONParser();
		try (Reader reader = new FileReader("c:\\projects\\test.json")) {
			JSONObject jsonObject = (JSONObject) parser.parse(reader);
			return jsonObject;
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return null;
	}
	
	//REQUIRE: fileName != null && output != null
	//EFFECTS: writes the output JSONObject in a file named fileName.
	public static void write (String fileName, JSONObject obj) {
        try (FileWriter file = new FileWriter(fileName)) {
            file.write(obj.toJSONString());
        } catch (IOException e) {
            e.printStackTrace();
        }
	}
	
}
