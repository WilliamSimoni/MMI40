package general;

public class IdGenerator {
	
	private static int idelement=0;
	private static int idStyle=0;
	private static int idProps=0;
	

	
	public static String getNextIdStyle() {
		String ret= "S"+idStyle;
		idStyle++;
		return ret;
		
	}
	public static String getNextIdElement() {
		String ret= "E"+idelement;
		idelement++;
		return ret;
		
	}
	public static String getNextIdProps() {
		String ret= "P"+idProps;
		idProps++;
		return ret;
		
	}/*
	public static ID getNextIdStyle() {
		String ret= "S"+idStyle;
		idStyle++;
		ID id=new ID(ret);
		return id;
		
	}
	public static ID  getNextIdElement() {
		String ret= "E"+idelement;
		idelement++;
		ID id=new ID(ret);
		return id;
		
	}
	public static ID  getNextIdProps() {
		String ret= "P"+idProps;
		idProps++;
		ID id=new ID(ret);
		return id;
		
	}*/
}
