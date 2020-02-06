package javaPytj;

import IOoperations.*;

public class Driver {

	public static void main(String[] args) {
		
		if (args.length < 1) {
			System.out.println("indicate yaml file to starting writing from");
			System.exit(-1);
		}
		
		String inputFile = args[0];
		
		Converter cv = new Converter();
		
		JsonIO.write("result.json", cv.convert(inputFile));
	}
	
	
	
}
